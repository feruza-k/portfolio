export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += char; }
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      const raw = (values[i] ?? "").replace(/^"|"$/g, "");
      // Only strip formatting commas from values that are purely numeric (e.g. "1,234").
      // Text fields that legitimately contain commas must be preserved.
      row[h] = /^[\d,]+(\.\d+)?$/.test(raw) ? raw.replace(/,/g, "") : raw;
    });
    return row;
  });
}
