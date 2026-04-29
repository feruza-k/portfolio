# Thesis: Location Intelligence for Café Site Selection
# Feruza Kachkinbayeva, MSc Big Data & Business Intelligence
# University of Greenwich, September 2024
# SLA Masters Award 2024, 2nd Place

---

## Overview and Research Objectives

Title: Location Intelligence for Café Site Selection: Predicting Success and
Commercial Rent Prices in London.

Institution: University of Greenwich, MSc Big Data & Business Intelligence.
Submitted: September 6, 2024. Word count: 16,361.
Supervisor: Dr Sanyaade Olufemi Adekoya.
Award: SLA Masters Award 2024, 2nd Place.

The problem: 74% of new cafés fail within five years in the UK. The UK coffee
shop market is valued at approximately £4.5 billion with 6% annual growth, yet
the failure rate remains high. Most site selection decisions are made on gut
instinct, postcode-level demographics, and limited market research: which can
cost £50,000+ to get wrong.

Three research objectives:
1. Develop a comprehensive predictive model for assessing café success potential by analysing demographics, competition density, foot traffic, and local amenities, producing a success score per LSOA categorised into Low / Medium / High / Very High.
2. Build a rent prediction model using machine learning to estimate commercial
   rent prices across all London LSOAs.
3. Perform comparative analysis integrating predicted rent with success levels
   to rank locations by combined opportunity score.

The framework operates at LSOA (Lower Super Output Area) granularity: 4,835
LSOAs covering all of Greater London. LSOA granularity matters: conditions vary
significantly within short distances in London, and borough-level analysis misses
it.

---

## Data Sources and Feature Engineering

Six datasets merged on LSOA code. Final unified dataset: 4,835 records × 16 features.

Exact data source years by feature:
- Population Size: 2015, source ONS (Office for National Statistics)
- Average Age: 2015, source ONS
- Employment Rate: underlying data from 2011, published in LSOA Atlas 2014 via London Data Store
- Average Income / Median Household Income: 2015, source Data.gov.uk
- Index of Multiple Deprivation: 2024, source Doogal
- Distance to Station: 2024, source Doogal
- PT Accessibility Levels (PTAL): 2014, source TfL via London Data Store
- Median House Price: 2023, source ONS
- Geographic metadata (LSOA codes, zones, lat/lon): 2024, source Doogal
- Competitors, Cafe Score, Reviews, Amenities: 2024, web scraped via Apify Google Maps Extractor
- Crime Rate: 2023 to 2024, source Metropolitan Police Service
- Rent Prices (347 labelled records): 2024, manually extracted from PropertyLink and OnTheMarket
- Validation rent records (20 records): 2024, manually extracted
- Geographic boundaries (Shapefile for maps): 2012, source Greater London Authority Statistical GIS

Key acknowledged limitation: no direct foot traffic data exists at LSOA level.
Amenity count and PTAL were used as proxies. Some demographic variables
(employment rate, population) date from 2011 to 2015 and may not reflect 2024
conditions.

Preprocessing: MinMax normalisation applied to bring all features onto a 0 to 1
scale. Missing values imputed. Pipeline ran in Python on Google Colab using
Pandas and GeoPandas.

---

## Task 1: Clustering Analysis: K-Means and DBSCAN

Unsupervised ML was the first approach to success prediction.

K-Means (K=3, Elbow Method): Silhouette Score = 0.37: moderate cluster overlap.
Clusters separated areas by income, crime, amenities, and competition density,
but the boundaries were not crisp enough for actionable recommendations.

DBSCAN (eps=0.2, min_samples=7): Silhouette Score = 0.51: better separation.
Key cluster structure: noise cluster (-1) contained high income, high crime,
high amenities, high competition LSOAs; Cluster 0 showed lower crime, fewer
amenities, minimal competition; Cluster 1 had moderate crime/income/amenities
with higher Café Scores.

Conclusion: both methods provided useful spatial groupings but neither fully
captured the complexity of success prediction. Clustering was exploratory. AHP became the primary decision framework because it allows explicit weighting of criteria rather than deriving implicit groupings from the data alone.

---

## Task 1: AHP Methodology, Weights, and Results

AHP (Analytic Hierarchy Process) transforms expert pairwise judgements into
quantitative weights for multi-criteria decision-making.

A pairwise comparison matrix was constructed for 12 criteria. Eigenvalue
decomposition produced the priority weight vector.

Consistency check: Consistency Ratio (CR) = 0.0693: below the 0.10 threshold,
confirming the pairwise comparisons are reliable and internally consistent.

Sensitivity analysis: each criterion weight adjusted by ±10%. PT Accessibility
Levels had the highest sensitivity: small changes in its weight shifted AHP
scores the most across London. This confirmed its dominant influence on the
model.

Full AHP criterion weights:
- PT Accessibility Levels (PTAL 2014): 16.92%: highest weight; foot traffic
  is strongly determined by transit access
- Median House Price 2023: 13.32%: affluence proxy
- Index of Multiple Deprivation: 11.75%: inverse relationship; deprivation
  reduces success potential
- Café Score (customer ratings): 10.59%: customer satisfaction signal
- Distance to Station: 10.17%
- Crime Rate per 1,000: 8.80%
- Average Income: 3.65%
- Employment Rate (2011): 5.03%
- Population Size (2015): 1.82%
- Average Age (2015): 2.92%
- Amenities/Walk Score: approximately 8–10%
- Competition Density: approximately 9–11%

The AHP Weighted Score for each LSOA is the dot product of normalised feature
values and these weights. Scores were divided into four percentile-based
categories: Low / Medium / High / Very High Success.

Visualised using GeoPandas + Matplotlib (static choropleth) and Folium
(interactive map with per-LSOA tooltips showing all underlying criteria).

Key finding: Central London and affluent inner neighbourhoods dominate the Very
High Success category. The more interesting output is emerging neighbourhoods
with medium-high scores that do not show up in traditional market research: lower-rent areas with viability that conventional analysis misses.

---

## Task 2: Semi-Supervised Rent Prediction

Rent prediction used semi-supervised learning (pseudo-labelling) due to data
scarcity: only 347 labelled records out of 8,000 total LSOAs.

Pseudo-labelling approach: train an initial model on the 347 labelled records,
generate predicted rent values for unlabelled LSOAs with high confidence,
add those as training data, retrain. Requires careful validation to avoid
compounding prediction errors across iterations.

Two models compared: Random Forest Regressor vs Linear Regression with
Polynomial Features.

Results (5-fold cross-validation):
- Random Forest: R² = 0.9531, MAE = 1.08 GBP per sq ft
- Linear Regression: R² = 0.6194, MAE = 9.56 GBP per sq ft
- ANOVA confirmed the difference is statistically significant (p < 0.05)

Rent range in labelled data: £15.18 to £62.59 per sq ft across London LSOAs.

Learning curve showed good generalisation: training score and cross-validation
score converged as additional pseudo-labelled data was added, confirming the
semi-supervised approach was not overfitting.

Hyperparameter tuning applied to the Random Forest after initial evaluation.

Visualised using GeoPandas + Folium interactive maps showing predicted rent per
LSOA with tooltip breakdowns.

---

## Task 3: Comparative Analysis, Key Findings, and Limitations

Predicted rents compared against 20 actual market validation records.

The combined ranking identifies LSOAs where success potential is high AND
actual rent is below the model's predicted market rate. That intersection is
where you open a café: high viability at below-market cost.

Key findings:
- Central London LSOAs (high PTAL, high income, high amenities) dominate Very
  High Success: e.g., Tower Hamlets area LSOAs with AHP scores around 139,000+
- Outer London shows predominantly Low to Medium success levels
- PT Accessibility is the single most influential factor (16.92%): more
  important than demographics or competition alone
- Random Forest at R² = 0.95 is a viable rent prediction tool for London LSOAs
- The model surfaces emerging neighbourhoods: lower-rent areas with medium-high
  success potential not obvious from traditional market research

Limitations:
- Aggregated LSOA-level data lacks granularity: no individual footfall counts,
  no real-time data
- Demographic variables from 2011–2015 may not reflect 2024 conditions
- K-Means and DBSCAN showed moderate overlap; used for exploration not final output
- Model generalisation beyond London untested: framework is replicable but
  requires recalibration for other cities

What I would do differently: the AHP weights were set from literature review and
expert judgement, not empirical optimisation. I would back-calculate weights from
known success/failure outcomes if the data existed. The rent model also relied
heavily on demographic proxies: real-time foot traffic from mobile telemetry
would substantially improve it.

Tech stack: Python, Google Colab, Pandas, GeoPandas, Scikit-learn (KMeans,
DBSCAN, RandomForestRegressor, LinearRegression, GridSearchCV, MinMaxScaler,
SimpleImputer), Folium, Matplotlib, Apify.
