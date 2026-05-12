import { describe, it, expect } from "vitest";
import { parseCSV } from "@/lib/csv";

describe("parseCSV", () => {
  it("parses headers and values correctly", () => {
    const csv = "Name,Score\nAlice,42\nBob,99";
    const result = parseCSV(csv);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ Name: "Alice", Score: "42" });
    expect(result[1]).toEqual({ Name: "Bob", Score: "99" });
  });

  it("preserves commas inside quoted text fields", () => {
    const csv = `Code,Name\nE01,"Brixton, London"`;
    const result = parseCSV(csv);
    expect(result[0].Name).toBe("Brixton, London");
  });

  it("strips formatting commas from numeric values", () => {
    const csv = "Code,Population\nE01,4835";
    const result = parseCSV(csv);
    expect(result[0].Population).toBe("4835");
  });

  it("handles quoted numeric values with formatting commas", () => {
    const csv = `Code,Score\nE01,"1,234"`;
    const result = parseCSV(csv);
    expect(result[0].Score).toBe("1234");
  });

  it("returns empty array for single-line (headers only) input", () => {
    expect(parseCSV("Name,Value")).toEqual([]);
  });

  it("fills missing trailing values with empty string", () => {
    const csv = "A,B,C\n1,2";
    const result = parseCSV(csv);
    expect(result[0].C).toBe("");
  });
});
