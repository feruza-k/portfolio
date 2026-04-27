import { ImageResponse } from "next/og";

export const alt = "Feruza Kachkinbayeva — AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PARTICLES = [
  { x: 90,  y: 70  }, { x: 210, y: 160 }, { x: 55,  y: 310 },
  { x: 170, y: 420 }, { x: 100, y: 560 }, { x: 300, y: 80  },
  { x: 380, y: 200 }, { x: 260, y: 530 }, { x: 440, y: 590 },
  { x: 580, y: 45  }, { x: 640, y: 180 }, { x: 510, y: 390 },
  { x: 600, y: 490 }, { x: 720, y: 90  }, { x: 790, y: 250 },
  { x: 850, y: 130 }, { x: 950, y: 70  }, { x: 1050, y: 180 },
  { x: 1120, y: 60 }, { x: 920, y: 310 }, { x: 1040, y: 390 },
  { x: 1130, y: 280 }, { x: 860, y: 460 }, { x: 980, y: 540 },
  { x: 1100, y: 500 }, { x: 750, y: 560 }, { x: 680, y: 580 },
  { x: 1150, y: 420 }, { x: 340, y: 330 }, { x: 470, y: 260 },
];

const DIST = 170;

function buildLines() {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < PARTICLES.length; i++) {
    for (let j = i + 1; j < PARTICLES.length; j++) {
      const dx = PARTICLES[i].x - PARTICLES[j].x;
      const dy = PARTICLES[i].y - PARTICLES[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < DIST) {
        lines.push({ x1: PARTICLES[i].x, y1: PARTICLES[i].y, x2: PARTICLES[j].x, y2: PARTICLES[j].y });
      }
    }
  }
  return lines;
}

const LINES = buildLines();

export default async function Image() {
  let fontData: ArrayBuffer | null = null;
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Syne:wght@700",
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; Next.js OG)" } }
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    if (url) fontData = await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    // falls back to system-ui
  }

  const font = fontData ? "Syne" : "system-ui, sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0c0c0e",
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gradient layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 90% 10%, rgba(79,196,160,0.08) 0%, transparent 45%), radial-gradient(ellipse at 5% 95%, rgba(139,92,246,0.05) 0%, transparent 40%)",
            display: "flex",
          }}
        />

        {/* Particle network */}
        <svg width="1200" height="630" style={{ position: "absolute", inset: 0 }}>
          {LINES.map((l, i) => (
            <line
              key={i}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke="#4fc4a0"
              strokeWidth="0.7"
              strokeOpacity="0.09"
            />
          ))}
          {PARTICLES.map((p, i) => (
            <circle
              key={i}
              cx={p.x} cy={p.y} r="2"
              fill="#4fc4a0"
              fillOpacity="0.22"
            />
          ))}
        </svg>

        {/* CTA — pinned top-right */}
        <div
          style={{
            position: "absolute",
            top: 160,
            right: 80,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 16,
              color: "#4fc4a0",
              opacity: 0.7,
              letterSpacing: "0.06em",
            }}
          >
            ↗ ask me anything
          </span>
        </div>

        {/* Badge — pinned top-left */}
        <div
          style={{
            position: "absolute",
            top: 52,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 9,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#4fc4a0",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 16,
              color: "#4fc4a0",
              letterSpacing: "0.14em",
            }}
          >
            feruza.dev
          </span>
        </div>

        {/* Name + meta — anchored to bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 110,
            left: 80,
            right: 80,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <span
              style={{
                fontFamily: font,
                fontSize: 108,
                fontWeight: 700,
                color: "#f2ede6",
                lineHeight: 0.95,
                letterSpacing: "-0.035em",
                textShadow: "0 0 60px rgba(79,196,160,0.28), 0 0 120px rgba(79,196,160,0.12)",
              }}
            >
              Feruza
            </span>
            <span
              style={{
                fontFamily: font,
                fontSize: 108,
                fontWeight: 700,
                color: "#f2ede6",
                lineHeight: 1.0,
                letterSpacing: "-0.035em",
                textShadow: "0 0 60px rgba(79,196,160,0.28), 0 0 120px rgba(79,196,160,0.12)",
              }}
            >
              Kachkinbayeva
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.08)",
              margin: "28px 0 24px",
              display: "flex",
              width: "100%",
            }}
          />

          {/* Meta row */}
          <div style={{ display: "flex" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 24,
                color: "#a09c96",
                letterSpacing: "0.03em",
              }}
            >
              Applied AI Engineer · London
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Syne", data: fontData, weight: 700, style: "normal" }]
        : [],
    }
  );
}
