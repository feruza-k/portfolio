2026-04-16
The hardest part of the HESA project wasn't the RAG pipeline. It was figuring out what the assistant should refuse to do. Constraint design is underrated. Most AI products are built to do more. The interesting ones are built around what they won't do.

2026-04-12
Two providers, one site. OpenAI for embeddings, Claude for the agent.
text-embedding-3-large is accurate and cheap enough that replacing it would just be stubbornness. Claude holds up better under constraint. Stays in character, knows when not to answer. For an assistant partly defined by what it refuses, that matters.
The other decision was when to RAG and when to inject fully. The corpus is small so full injection works most of the time. RAG earns its place at the edges, where dumping full context would confuse more than help. Inject everything until context becomes a liability. Then retrieve.

2026-02-05 
Started with Django because HESA hub is mostly governance before it's anything else. Four roles, invitation flow, forced password resets, append-only audit log. Django gives you all of that on day one. The interesting work was the quality rule pipeline and risk computation, and I wanted the boring parts already solved before I got there.


2026-01-15
LifeOS shipping in 31 days taught me that working and right are different things. The retrieval scoring was fast and it worked but it wasn't right. I shipped it anyway. The lesson wasn't to slow down. It was to know what you're optimising for before you start.

2024-10-28
The AHP consistency ratio for the café site intelligence model came in at 0.06. Acceptable threshold is 0.10. I was surprised — when you're building a weighting system for something as messy as commercial viability, getting under 0.10 means the logic actually holds together. That number mattered more to me than the prize.

2024-08-02
The hardest part of the thesis wasn't the ML accuracy. It was finding the right data. That took half the project time.
Footfall is one of the strongest predictors of commercial success for a new business. But per-LSOA footfall data costs real money. I couldn't afford it. So I scraped every amenity I could find across London (restaurants, hotels, cinemas, theatres, museums, attractions, etc.) mapped postcodes to LSOAs, and used amenity density as a proxy. It held up.
Sometimes the data you need doesn't exist. You build a signal from what does.