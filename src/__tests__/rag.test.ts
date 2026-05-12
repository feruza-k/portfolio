import { describe, it, expect } from "vitest";
import { cosine } from "@/lib/rag";

describe("cosine similarity", () => {
  it("returns 1.0 for identical vectors", () => {
    const v = [1, 0.5, 0.25];
    expect(cosine(v, v)).toBeCloseTo(1.0);
  });

  it("returns 0.0 for orthogonal vectors", () => {
    expect(cosine([1, 0, 0], [0, 1, 0])).toBeCloseTo(0.0);
  });

  it("returns -1.0 for opposite vectors", () => {
    expect(cosine([1, 0, 0], [-1, 0, 0])).toBeCloseTo(-1.0);
  });

  it("ranks chunks correctly by similarity to query", () => {
    const query = [1, 0, 0];
    const chunks = [
      { id: "weak",   vec: [0.1, 0.9, 0] },
      { id: "strong", vec: [0.9, 0.1, 0] },
      { id: "mid",    vec: [0.5, 0.5, 0] },
    ];
    const ranked = chunks
      .map((c) => ({ id: c.id, score: cosine(query, c.vec) }))
      .sort((a, b) => b.score - a.score);

    expect(ranked[0].id).toBe("strong");
    expect(ranked[1].id).toBe("mid");
    expect(ranked[2].id).toBe("weak");
  });

  it("handles high-dimensional vectors correctly", () => {
    const dim = 1536; // text-embedding-3-small dimension
    const a = Array.from({ length: dim }, (_, i) => (i % 3 === 0 ? 1 : 0));
    const b = Array.from({ length: dim }, (_, i) => (i % 3 === 0 ? 1 : 0));
    expect(cosine(a, b)).toBeCloseTo(1.0);
  });
});
