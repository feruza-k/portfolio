import { HeatMap } from "@/components/map/HeatMap";

const projects = [
  {
    number: "01",
    name: "LifeOS",
    problem:
      "Every app stored what I typed. None understood what I meant. After years of using note-taking tools that required me to remember where I put things, I wanted something that actually modelled context — not just search.",
    built:
      "A personal AI system built in December 2025. FastAPI backend with a memory layer that tracks context across conversations, not just retrieves documents. PostgreSQL for persistence, GPT-4o-mini for reasoning, React Native for the interface. 165 commits. 31 days. Used daily.",
    hard: "Memory that stays relevant without becoming noise.",
    different:
      "I'd invest more time in the retrieval evaluation earlier. I shipped too fast on the scoring logic and had to refactor it in week three. The architecture was right; the evaluation criteria took longer to get right than the code did.",
    tags: ["FastAPI", "OpenAI", "PostgreSQL", "React Native", "Railway"],
    status: "● live · 165 commits",
    link: "https://github.com/feruza-k/LifeOS",
    linkLabel: "github →",
  },
  {
    number: "02",
    name: "Location Intelligence — Café Site Selection",
    problem:
      "Site selection for a café costs £50,000+ to get wrong. Most of it is done on gut instinct, post-code level demographic data, and wishful thinking. My MSc thesis asked whether geospatial ML could close that gap.",
    built:
      "A spatial risk surface for London café viability using GeoPandas, Folium, and a multi-criteria AHP model. The pipeline ingests footfall data, competitor density, transport access, and neighbourhood demographics to produce probability scores at the street level.",
    hard:
      "Translating AHP weights into something a café owner could understand without a GIS degree.",
    different:
      "The model is sound but the interface is a static map. A real product would need a proper UI — probably the Leaflet version of what you see below — and a feedback loop from operators who've used it to improve the priors.",
    tags: ["GeoPandas", "Folium", "AHP", "Python", "Spatial ML"],
    status: "🥈 SLA Masters Award 2024",
    link: "https://github.com/feruza-k/london-cafe-location-intelligence",
    linkLabel: "github →",
  },
  {
    number: "03",
    name: "HESA Stat Returns Hub",
    problem:
      "A statutory compliance process living in one person's head, three Excel files, and a shared drive no one could navigate. If that person left, the university would miss its legal reporting deadline.",
    built:
      "An AI compliance platform replacing that process. Django backend, React frontend, Azure OpenAI for the reasoning layer, RAG architecture over the official HESA guidance documents. The AI answers compliance questions, flags anomalies in submission data, and explains the rules in plain English — with citations, never hallucinated answers.",
    hard:
      "Designing an AI system that explains rules without ever guessing on the answer.",
    different:
      "The governance model was harder than the engineering. DPIA, Azure AD integration, pseudonymised data handling, audit logging — none of that is interesting to build but all of it is what makes the difference between a demo and a system someone trusts with statutory data.",
    tags: ["Django", "React", "Azure OpenAI", "RAG", "PostgreSQL"],
    status: "🔨 active development · private repo",
    link: null,
    linkLabel: null,
  },
];

export function TheWork() {
  return (
    <section id="work" className="py-12">
      <div className="section-label mb-8">§ 01</div>
      <div className="space-y-16">
        {projects.map((project, index) => (
          <div key={project.number}>
            <article className="space-y-4">
              {/* Header */}
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[11px] text-muted">
                  {project.number}
                </span>
                <h2 className="font-display text-[22px] font-bold text-ink">
                  {project.name}
                </h2>
              </div>

              {/* Problem */}
              <p className="font-body text-[15px] text-muted italic leading-relaxed">
                {project.problem}
              </p>

              {/* What I built */}
              <p className="font-body text-[15px] text-secondary leading-relaxed">
                {project.built}
              </p>

              {/* What was hard */}
              <p className="font-mono text-[13px] text-ink">
                ↳ {project.hard}
              </p>

              {/* What I'd do differently */}
              <p className="font-body text-[14px] text-muted leading-relaxed">
                {project.different}
              </p>

              {/* Tags + status */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] text-muted border border-faint px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="font-mono text-[11px] text-muted">
                  {project.status}
                </span>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-ink hover:text-muted transition-colors underline underline-offset-2"
                  >
                    {project.linkLabel}
                  </a>
                )}
              </div>
            </article>

            {/* Map embedded between project 1 and 2 */}
            {index === 0 && (
              <div className="mt-12 -mx-6">
                <HeatMap />
              </div>
            )}

            {index < projects.length - 1 && (
              <div className="mt-12 section-divider" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
