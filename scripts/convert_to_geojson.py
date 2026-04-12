"""
Convert lsoa_success_levels_with_geo.csv (WKT geometry in EPSG:27700)
to public/data/london_lsoa.geojson for use with react-leaflet.

Usage:
  pip install geopandas
  python scripts/convert_to_geojson.py
"""

import sys
from pathlib import Path

try:
    import pandas as pd
    import geopandas as gpd
    from shapely import wkt
except ImportError:
    print("Error: run  pip install geopandas shapely")
    sys.exit(1)

SRC = Path("public/data/lsoa_success_levels_with_geo.csv")
OUT = Path("public/data/london_lsoa.geojson")

if not SRC.exists():
    print(f"Error: {SRC} not found.")
    sys.exit(1)

print(f"Reading {SRC}...")
df = pd.read_csv(SRC)

# Parse WKT geometry column
print("Parsing WKT geometry...")
df["geometry"] = df["geometry"].apply(wkt.loads)

# Build GeoDataFrame, set source CRS (British National Grid) and reproject to WGS84
gdf = gpd.GeoDataFrame(df, geometry="geometry", crs="EPSG:27700")
gdf = gdf.to_crs(epsg=4326)

# Keep only the columns the map tooltip uses
keep = ["LSOA11CD", "LSOA Name", "Success Level", "AHP Weighted Score", "geometry"]
available = [c for c in keep if c in gdf.columns]
gdf = gdf[available]

print(f"Writing {OUT} ({len(gdf):,} features)...")
OUT.parent.mkdir(parents=True, exist_ok=True)
gdf.to_file(OUT, driver="GeoJSON")
print("Done.")
