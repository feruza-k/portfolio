"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ZoomControl,
} from "react-leaflet";
import type { GeoJsonObject, Feature, Geometry, GeoJsonProperties } from "geojson";
import type { PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";

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
  "Low Success":       "#a8dfd0",   // lightest — pale teal
  "Medium Success":    "#4fc4a0",   // brand teal
  "High Success":      "#2d8a65",   // deeper green
  "Very High Success": "#0f4a30",   // deepest — dark forest
};

const FILTER_LABELS: Record<Filter, string> = {
  All: "All",
  "Very High Success": "Very High",
  "High Success": "High",
  "Medium Success": "Medium",
  "Low Success": "Low",
};

interface MapClientProps {
  filterOptions: readonly Filter[];
}

export default function MapClient({ filterOptions: _ }: MapClientProps) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/data/london_lsoa.geojson")
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => setGeoData(data))
      .catch(() => setError(true));
  }, []);

  function styleFeature(feature: Feature<Geometry, GeoJsonProperties> | undefined): PathOptions {
    const level = feature?.properties?.["Success Level"] ?? "";
    return {
      fillColor: COLOR_MAP[level] ?? "#a8dfd0",
      fillOpacity: 0.75,
      color: "#0c0c0e",
      weight: 0.3,
    };
  }

  function filterFeature(feature: Feature): boolean {
    if (activeFilter === "All") return true;
    return feature.properties?.["Success Level"] === activeFilter;
  }

  // Re-key the GeoJSON layer when filter changes so react-leaflet re-renders
  const filteredKey = activeFilter;

  return (
    <div>
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
      </div>

      {/* Map */}
      {error ? (
        <div className="w-full h-[520px] bg-[#111114] border border-[#1f1f23] flex flex-col items-center justify-center gap-3">
          <span className="font-mono text-[12px] text-[#6b7280]">
            map data not found
          </span>
          <span className="font-mono text-[11px] text-[#6b7280]/50">
            add london_lsoa.geojson to public/data/ and run the conversion script
          </span>
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
                key={filteredKey}
                data={geoData}
                style={styleFeature}
                filter={filterFeature}
                onEachFeature={(feature: Feature<Geometry, GeoJsonProperties>, layer) => {
                  const p = feature.properties ?? {};
                  layer.bindTooltip(
                    `<div class="lsoa-tooltip">
                      <span class="lsoa-code">${p["LSOA11CD"] ?? ""}</span>
                      <span class="lsoa-name">${p["LSOA Name"] ?? ""}</span>
                      <span class="lsoa-level">${p["Success Level"] ?? ""}</span>
                      <span class="lsoa-score">AHP score: ${Math.round(Number(p["AHP Weighted Score"] ?? 0)).toLocaleString()}</span>
                    </div>`,
                    { sticky: true, opacity: 1, className: "lsoa-tooltip-wrap" }
                  );
                }}
              />
            )}

            {!geoData && !error && (
              // Invisible placeholder — loading state is shown via parent skeleton
              <></>
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
