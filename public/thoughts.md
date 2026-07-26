2026-06-27 · grounded-ai
Quiz endpoint's closer to a real exam now, six domains, weighted distribution, timed, results at the end. Timer was the easy part. Harder part was giving each domain its own search keywords so questions actually test that domain instead of whatever's easiest to pull from the index. Otherwise you're just testing the index, not the person.

2026-06-26 · grounded-ai
Content safety checks in and out today, plus handling for when Azure OpenAI just blocks something. Thought this would be a thin wrapper at the end. It wasn't, every response path now needs a "this got blocked" branch that behaves like an actual answer, not an error page.

2026-06-21 · grounded-ai
Mostly AI-103 prep. Could've done plain embed-and-retrieve and called it done, added an entity extraction step instead so the retrieval query isn't just the raw question. More work upfront. Retrieval's noticeably less noisy for it.

2026-05-12 · feruza-dev
Built the agent with two retrieval paths: cosine similarity over pre-computed embeddings for thesis content, and a direct tool call for LSOA queries against the CSV. Could've put everything through RAG but the LSOA data is structured, specific numbers per area, and retrieval over prose chunks would've lost precision. Embeddings for the unstructured stuff, direct lookup for the structured stuff. Let the data shape pick the method.

2026-05-06 · hesa-stat-returns-hub
Rebuilt the insights tab. First pass was a dashboard, because that's the default when you're not sure what someone needs. Turns out what people actually wanted was one question answered: how far from the deadline, and what's blocking it. Smaller question than a dashboard usually answers. Better one.

2026-04-22 · hesa-stat-returns-hub
Whole week on hardening, file validation, rate limits on the sensitive stuff, safer file storage. Nothing here I'll ever put in a demo. All of it is the actual difference between "prototype" and "thing I'd trust with a real return."

2026-04-16 · hesa-stat-returns-hub
Realised the submission flow is really several distinct checkpoints wearing one UI. Tried to merge some of them for a cleaner screen, twice. Both times I lost track of what actually happened at each stage. Left them separate. The friction is doing something.

2026-04-12 · hesa-stat-returns-hub
Bug today: later pipeline steps were showing as ready before the first upload even existed. Small fix, but annoying, because it meant "done" wasn't actually defined properly for half the steps. One of them happens on an external site I don't control, so I ended up just tracking "did they click through" as its own signal. Not pretty. Works.

2026-04-08 · hesa-stat-returns-hub
Core File generation now strips personal information before anything leaves the system. Could've treated this as a formatting step and moved on. Didn't feel right to. This is the one part of the whole pipeline where a mistake actually ships somewhere.

2026-04-02 · hesa-stat-returns-hub
Quality rules UI, inline edit, failure reports, filtering. Almost built one generic table component for everything, then remembered a rule failure and a task aren't actually the same shape of thing even though they look similar in a wireframe. Kept them separate. More code, less confusion later.

2026-03-24 · hesa-stat-returns-hub
Moved to PostgreSQL. Not really about the database, honestly, more that it made me finalise the schema instead of leaving it vague. Should've done that earlier.

2026-03-14 · hesa-stat-returns-hub
REST API and the pipeline shape this week. Kept wanting to squash Institution, Return, and everything else into fewer tables, it'd be so much less typing. Didn't do it. A Return is genuinely Institution + Collection + AcademicYear and if I flatten that now I'm just writing workaround queries for the next six months.

2026-03-03 · hesa-stat-returns-hub
Auth and invitations built out this week. Four roles, admin/lead/manager/viewer, everyone scoped to their institution except admin. This is a tool universities will use to manage statutory returns, so access control isn't something to rush past, it's the part that can't be wrong later.

2026-02-05 · hesa-stat-returns-hub
Picked Django before writing anything else. This is a governance tool before it's anything clever, four roles, invitations, forced password resets, an audit log nobody can edit after the fact. Django gives you most of that out of the box. Wanted the boring parts solved before I got anywhere near the quality rule pipeline, which is the bit I actually want to build.

2026-01-15 · lifeos
LifeOS shipped in 31 days. Learned working and right aren't the same thing the hard way, the retrieval scoring was fast, it worked, it wasn't right. Shipped it anyway. Not saying slow down next time, saying know what you're actually optimising for before you start, because I didn't and it showed.

2024-10-28 · london-cafe-location-intelligence
AHP consistency ratio for the café model came in at 0.06. Threshold is 0.10. Genuinely surprised by that, when you're weighting something as messy as commercial viability, getting that far under the threshold means the logic actually holds together, not just the numbers. Mattered more to me than the prize did.

2024-08-02 · london-cafe-location-intelligence
Hardest part of the thesis wasn't the ML accuracy, it was finding the right data. Took about half the project. Footfall is one of the strongest predictors of whether a new business survives, but per-LSOA footfall data costs real money and I didn't have it. Scraped every amenity I could find across London instead, restaurants, hotels, cinemas, theatres, museums, mapped it all to LSOAs, used amenity density as a stand-in. It held up. Sometimes the data you need doesn't exist and you build a signal from what does.
