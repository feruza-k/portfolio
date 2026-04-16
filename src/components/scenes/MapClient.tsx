"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ZoomControl,
} from "react-leaflet";
import type { GeoJsonObject, Feature, Geometry, GeoJsonProperties } from "geojson";
import type { PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Types ──────────────────────────────────────────────────────────────────────

type Filter =
  | "All"
  | "Very High Success"
  | "High Success"
  | "Medium Success"
  | "Low Success";

const FILTER_OPTIONS: Filter[] = [
  "All",
  "Very High Success",
  "High Success",
  "Medium Success",
  "Low Success",
];

const COLOR_MAP: Record<string, string> = {
  "Low Success":       "#a8dfd0",
  "Medium Success":    "#4fc4a0",
  "High Success":      "#2d8a65",
  "Very High Success": "#0f4a30",
};

const FILTER_LABELS: Record<Filter, string> = {
  All: "All",
  "Very High Success": "Very High",
  "High Success": "High",
  "Medium Success": "Medium",
  "Low Success": "Low",
};

// ── AHP Configuration ──────────────────────────────────────────────────────────
// Weights from thesis Table 2. Direction: true = higher is better, false = inverse.

const AHP_FACTORS = [
  { key: "PT Accessibility Levels 2014", label: "Transport Access", weight: 16.92, positive: true },
  { key: "Median House Price 2023",       label: "House Price",      weight: 13.32, positive: true },
  { key: "Index of Multiple Deprivation", label: "Deprivation",      weight: 11.75, positive: false },
  { key: "Cafe_Score",                    label: "Café Score",        weight: 10.59, positive: true },
  { key: "Distance to Station",           label: "Dist. to Station",  weight: 10.17, positive: false },
  { key: "Crime Rate per 1000",           label: "Crime Rate",        weight:  8.80, positive: false },
  { key: "Competitors",                   label: "Competitors",       weight:  7.56, positive: true },
  { key: "Amenities",                     label: "Amenities",         weight:  7.48, positive: true },
  { key: "Employment Rate 2011",          label: "Employment",        weight:  5.03, positive: true },
  { key: "Average Income",               label: "Income",            weight:  3.65, positive: true },
  { key: "Average Age 2015",             label: "Avg Age",           weight:  2.92, positive: true },
  { key: "Population 2015",             label: "Population",        weight:  1.82, positive: true },
] as const;

// ── Statistics row type ────────────────────────────────────────────────────────

interface StatsRow {
  "LSOA Code": string;
  "LSOA Name": string;
  "Employment Rate 2011": number;
  "PT Accessibility Levels 2014": number;
  "Population 2015": number;
  "Average Age 2015": number;
  "Median House Price 2023": number;
  District: string;
  "London Zone": number;
  "Distance to Station": number;
  "Average Income": number;
  Latitude: number;
  Longitude: number;
  "Index of Multiple Deprivation": number;
  Competitors: number;
  Cafe_Score: number;
  Reviews: number;
  Amenities: number;
  "Crime Rate per 1000": number;
}

interface SelectedLSOA {
  code: string;
  name: string;
  successLevel: string;
  ahpScore: number;
  stats: StatsRow | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface MapClientProps {
  filterOptions: readonly Filter[];
}

// ── CSV parser ─────────────────────────────────────────────────────────────────

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    // Handle quoted fields containing commas
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? "").replace(/^"|"$/g, "").replace(/,/g, "");
    });
    return row;
  });
}

// ── AHP contribution calculator ────────────────────────────────────────────────

interface FactorContribution {
  label: string;
  weight: number;
  rawValue: number;
  normValue: number;   // 0–1
  contribution: number; // weight * normValue (0–100)
  positive: boolean;
  performance: "strong" | "moderate" | "weak";
}

function computeContributions(
  stats: StatsRow,
  allStats: StatsRow[]
): FactorContribution[] {
  return AHP_FACTORS.map((factor) => {
    const key = factor.key as keyof StatsRow;
    const rawValue = Number(stats[key]) || 0;

    // Min/max across all LSOAs for normalisation
    const allValues = allStats.map((r) => Number(r[key]) || 0);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min || 1;

    // Normalise to 0–1, invert if negative factor
    let normValue = (rawValue - min) / range;
    if (!factor.positive) normValue = 1 - normValue;

    const contribution = (factor.weight / 100) * normValue * 100;

    // Performance tier for colour coding
    const performance: "strong" | "moderate" | "weak" =
      normValue >= 0.66 ? "strong" : normValue >= 0.33 ? "moderate" : "weak";

    return {
      label: factor.label,
      weight: factor.weight,
      rawValue,
      normValue,
      contribution,
      positive: factor.positive,
      performance,
    };
  });
}

function formatRaw(label: string, value: number): string {
  if (label === "House Price") return `£${Math.round(value).toLocaleString()}`;
  if (label === "Crime Rate") return `${value.toFixed(1)}/1k`;
  if (label === "Income") return `£${Math.round(value).toLocaleString()}`;
  if (label === "Dist. to Station") return `${value.toFixed(2)}km`;
  if (label === "Café Score") return value > 0 ? value.toFixed(1) : "n/a";
  if (label === "Competitors") return Math.round(value).toString();
  if (label === "Amenities") return Math.round(value).toString();
  if (label === "Population") return Math.round(value).toLocaleString();
  return value.toFixed(1);
}

// ── Main component ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function MapClient(_props: MapClientProps) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [allStats, setAllStats] = useState<StatsRow[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<SelectedLSOA | null>(null);
  const [panelTab, setPanelTab] = useState<"chart" | "chat">("chart");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load GeoJSON
  useEffect(() => {
    fetch("/data/london_lsoa.geojson")
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then((data) => setGeoData(data))
      .catch(() => setError(true));
  }, []);

  // Load Statistics CSV
  useEffect(() => {
    fetch("/data/LSOA Statistics.csv")
      .then((r) => r.text())
      .then((text) => {
        const rows = parseCSV(text);
        setAllStats(rows as unknown as StatsRow[]);
      })
      .catch(() => console.warn("LSOA Statistics.csv not found"));
  }, []);

  // Auto-scroll chat container — direct scrollTop keeps scroll inside the panel,
  // scrollIntoView would scroll the entire page
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages]);

  // When LSOA selected, send initial message to agent
  useEffect(() => {
    if (!selected || initialMessageSent) return;
    setInitialMessageSent(true);

    const initialMessage = `[MAP_CLICK] LSOA: ${selected.code} | Name: ${selected.name} | Success: ${selected.successLevel} | AHP Score: ${selected.ahpScore.toLocaleString()}${
      selected.stats
        ? ` | District: ${(selected.stats as unknown as Record<string, string>)["District"]} | Zone: ${(selected.stats as unknown as Record<string, string>)["London Zone"]} | PT Access: ${selected.stats["PT Accessibility Levels 2014"]} | House Price: £${Number(selected.stats["Median House Price 2023"]).toLocaleString()} | Crime: ${selected.stats["Crime Rate per 1000"]}/1k | Income: £${Number(selected.stats["Average Income"]).toLocaleString()} | Competitors: ${selected.stats["Competitors"]} | Amenities: ${selected.stats["Amenities"]} | Deprivation: ${selected.stats["Index of Multiple Deprivation"]}`
        : ""
    }`;

    sendToAgent(initialMessage, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  async function sendToAgent(text: string, history: ChatMessage[]) {
    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    setChatLoading(true);
    const userMsg: ChatMessage = { role: "user", text };
    const newHistory = [...history, userMsg];
    setChatMessages(newHistory);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m, i) => ({
            id: String(i),
            role: m.role,
            parts: [{ type: "text", text: m.text }],
          })),
        }),
        signal: abort.signal,
      });

      if (!response.ok || !response.body) throw new Error("Agent error");

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "text-delta" && parsed.delta) {
              assistantText += parsed.delta;
              setChatMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  text: assistantText,
                };
                return updated;
              });
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      // AbortError is intentional (user clicked a new LSOA) — don't show error
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Agent error:", err);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;
    setChatInput("");
    sendToAgent(trimmed, chatMessages);
  }

  function handleLSOAClick(
    code: string,
    name: string,
    successLevel: string,
    ahpScore: number
  ) {
    const statsRow = allStats.find(
      (r) => (r as unknown as Record<string, string>)["LSOA Code"] === code
    ) ?? null;

    // Cancel any in-flight stream before switching LSOAs
    abortRef.current?.abort();
    abortRef.current = null;

    // Only default to chart tab when the panel is first opening.
    // If the panel is already open, preserve whichever tab the user is on.
    if (!selected) setPanelTab("chart");

    setSelected({ code, name, successLevel, ahpScore, stats: statsRow });
    setChatMessages([]);
    setInitialMessageSent(false);
  }

  function styleFeature(
    feature: Feature<Geometry, GeoJsonProperties> | undefined
  ): PathOptions {
    const level = feature?.properties?.["Success Level"] ?? "";
    const code = feature?.properties?.["LSOA11CD"] ?? "";
    const isSelected = !!selected && code === selected.code;
    return {
      fillColor: COLOR_MAP[level] ?? "#a8dfd0",
      fillOpacity: isSelected ? 0.95 : 0.75,
      color: isSelected ? "#f2ede6" : "#0c0c0e",
      weight: isSelected ? 2 : 0.3,
    };
  }

  function filterFeature(feature: Feature): boolean {
    if (activeFilter === "All") return true;
    return feature.properties?.["Success Level"] === activeFilter;
  }

  // Derive stats row reactively — recomputes when allStats arrives after a click
  const selectedStats = useMemo(() => {
    if (!selected || allStats.length === 0) return null;
    return allStats.find(
      (r) => (r as unknown as Record<string, string>)["LSOA Code"] === selected.code
    ) ?? null;
  }, [selected?.code, allStats]);

  const contributions = useMemo(
    () => selectedStats ? computeContributions(selectedStats, allStats) : [],
    [selectedStats, allStats]
  );

  const maxContribution = Math.max(...contributions.map((c) => c.contribution), 1);

  return (
    <div className="relative">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`font-mono text-[11px] px-3 py-1.5 border transition-opacity duration-300 ${
              activeFilter === f
                ? "border-[#4fc4a0]/60 text-[#4fc4a0] bg-[#4fc4a0]/5"
                : "border-[#1f1f23] text-[#6b7280] hover:text-[#f2ede6] hover:border-[#1f1f23]/60"
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
        {selected && (
          <span className="ml-auto font-mono text-[11px] text-[#4fc4a0]/70 self-center">
            {selected.name} selected — click map to change
          </span>
        )}
      </div>

      {/* Map + Panel layout */}
      <div className="flex gap-0 relative">
        {/* Map */}
        <div
          className={`transition-all duration-500 ${
            selected ? "w-[55%]" : "w-full"
          }`}
        >
          {error ? (
            <div className="w-full h-[520px] bg-[#111114] border border-[#1f1f23] flex flex-col items-center justify-center gap-3">
              <span className="font-mono text-[12px] text-[#6b7280]">map data not found</span>
            </div>
          ) : (
            <div className="w-full h-[520px] border border-[#1f1f23] overflow-hidden leaflet-dark">
              <MapContainer
                center={[51.505, -0.09]}
                zoom={10}
                style={{ height: "100%", width: "100%", background: "#0c0c0e" }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  maxZoom={19}
                />
                <ZoomControl position="bottomright" />

                {geoData && (
                  <GeoJSON
                    key={`${activeFilter}-${selected?.code ?? ""}`}
                    data={geoData}
                    style={styleFeature}
                    filter={filterFeature}
                    onEachFeature={(
                      feature: Feature<Geometry, GeoJsonProperties>,
                      layer
                    ) => {
                      const p = feature.properties ?? {};
                      const code = p["LSOA11CD"] ?? "";
                      const name = p["LSOA Name"] ?? "";
                      const level = p["Success Level"] ?? "";
                      const score = Math.round(Number(p["AHP Weighted Score"] ?? 0));

                      layer.bindTooltip(
                        `<div class="lsoa-tooltip">
                          <span class="lsoa-code">${code}</span>
                          <span class="lsoa-name">${name}</span>
                          <span class="lsoa-level">${level}</span>
                          <span class="lsoa-score">AHP score: ${score.toLocaleString()}</span>
                          <span class="lsoa-hint">click to analyse</span>
                        </div>`,
                        {
                          sticky: true,
                          opacity: 1,
                          className: "lsoa-tooltip-wrap",
                        }
                      );

                      layer.on("click", () => {
                        handleLSOAClick(code, name, level, score);
                      });
                    }}
                  />
                )}
              </MapContainer>
            </div>
          )}
        </div>

        {/* Side panel */}
        {selected && (
          <div className="w-[45%] h-[520px] bg-[#0d0d0f] border border-[#1f1f23] border-l-0 flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="px-4 py-3 border-b border-[#1f1f23] flex items-start justify-between shrink-0">
              <div>
                <div className="font-mono text-[10px] text-[#6b7280] mb-0.5">
                  {selected.code}
                </div>
                <div className="font-mono text-[13px] text-[#f2ede6] font-medium">
                  {selected.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="font-mono text-[10px] px-2 py-0.5"
                    style={{
                      color: COLOR_MAP[selected.successLevel] ?? "#4fc4a0",
                      borderColor: (COLOR_MAP[selected.successLevel] ?? "#4fc4a0") + "40",
                      border: "1px solid",
                      background: (COLOR_MAP[selected.successLevel] ?? "#4fc4a0") + "10",
                    }}
                  >
                    {selected.successLevel}
                  </span>
                  <span className="font-mono text-[10px] text-[#6b7280]">
                    AHP {selected.ahpScore.toLocaleString()}
                  </span>
                  {selectedStats && (
                    <span className="font-mono text-[10px] text-[#6b7280]">
                      Zone {(selectedStats as unknown as Record<string, string>)["London Zone"]} · {(selectedStats as unknown as Record<string, string>)["District"]}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setSelected(null); setPanelTab("chart"); }}
                className="text-[#6b7280] hover:text-[#f2ede6] font-mono text-[14px] leading-none mt-0.5"
                aria-label="Close panel"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#1f1f23] shrink-0">
              {(["chart", "chat"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPanelTab(tab)}
                  className={`flex-1 font-mono text-[11px] py-2 transition-colors duration-200 ${
                    panelTab === tab
                      ? "text-[#4fc4a0] border-b border-[#4fc4a0]"
                      : "text-[#6b7280] hover:text-[#f2ede6]"
                  }`}
                >
                  {tab === "chart" ? "AHP breakdown" : "ask Feruza"}
                </button>
              ))}
            </div>

            {/* Chart tab */}
            {panelTab === "chart" && (
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                <p className="font-mono text-[10px] text-[#6b7280] mb-3">
                  Each bar shows how much this factor contributes to the total AHP score.
                  Weight × normalised area value.
                </p>
                {contributions.map((c) => (
                  <div key={c.label} className="group">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-mono text-[10px] text-[#9b9b9b] group-hover:text-[#f2ede6] transition-colors">
                        {c.label}
                      </span>
                      <span className="font-mono text-[10px] text-[#6b7280]">
                        {formatRaw(c.label, c.rawValue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-[6px] bg-[#1a1a1e] rounded-sm overflow-hidden">
                        <div
                          className="h-full rounded-sm transition-all duration-700"
                          style={{
                            width: `${(c.contribution / maxContribution) * 100}%`,
                            background:
                              c.performance === "strong"
                                ? "#2d8a65"
                                : c.performance === "moderate"
                                ? "#e6a817"
                                : "#a83232",
                          }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-[#6b7280] w-[28px] text-right shrink-0">
                        {c.weight}%
                      </span>
                    </div>
                  </div>
                ))}
                {contributions.length === 0 && (
                  <p className="font-mono text-[11px] text-[#6b7280] mt-4">
                    Statistics data not loaded. Check LSOA Statistics.csv is in public/data/.
                  </p>
                )}
              </div>
            )}

            {/* Chat tab */}
            {panelTab === "chat" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages */}
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {chatMessages.length === 0 && chatLoading && (
                    <div className="flex items-center gap-2 text-[#6b7280] font-mono text-[11px]">
                      <span className="animate-spin inline-block w-3 h-3 border border-[#4fc4a0] border-t-transparent rounded-full" />
                      thinking...
                    </div>
                  )}
                  {chatMessages.map((m, i) => (
                    <div key={i}>
                      {m.role === "user" ? (
                        <div className="flex gap-2">
                          <span className="text-[#4fc4a0] font-mono text-[11px] shrink-0 mt-0.5">❯</span>
                          <span className="font-mono text-[11px] text-[#f2ede6]">{m.text.replace(/^\[MAP_CLICK\].*$/, "").trim() || "Tell me about this area"}</span>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <span className="text-[#4fc4a0] font-mono text-[11px] shrink-0 mt-0.5">◆</span>
                          <span className="font-mono text-[11px] text-[#9b9b9b] leading-relaxed whitespace-pre-wrap">
                            {m.text || (
                              <span className="flex items-center gap-1.5">
                                <span className="animate-spin inline-block w-3 h-3 border border-[#4fc4a0] border-t-transparent rounded-full" />
                                thinking...
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Chat input */}
                <form
                  onSubmit={handleChatSubmit}
                  className="flex items-center gap-2 border-t border-[#1f1f23] px-4 py-2.5 shrink-0"
                >
                  <span className="font-mono text-[10px] text-[#4fc4a0]/40 select-none">$</span>
                  <input
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about this area..."
                    disabled={chatLoading}
                    className="flex-1 bg-transparent font-mono text-[11px] text-[#f2ede6] placeholder:text-[#6b7280] focus:outline-none disabled:opacity-40"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="font-mono text-[10px] text-[#4fc4a0] disabled:opacity-30 hover:text-[#f2ede6] transition-colors"
                  >
                    send
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click hint — shown before first selection */}
      {!selected && geoData && (
        <p className="mt-3 font-mono text-[11px] text-[#6b7280]/60 text-center">
          click any area to analyse its AHP breakdown and ask questions
        </p>
      )}
    </div>
  );
}
