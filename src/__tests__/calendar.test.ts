import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isCalendarConfigured, getLondonUTCOffset } from "@/lib/calendar";

describe("isCalendarConfigured", () => {
  const VARS = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN"] as const;
  const saved: Partial<Record<string, string>> = {};

  beforeEach(() => {
    VARS.forEach((k) => {
      saved[k] = process.env[k];
      delete process.env[k];
    });
  });

  afterEach(() => {
    VARS.forEach((k) => {
      if (saved[k] !== undefined) process.env[k] = saved[k];
      else delete process.env[k];
    });
  });

  it("returns false when all env vars are absent", () => {
    expect(isCalendarConfigured()).toBe(false);
  });

  it("returns false when only some env vars are present", () => {
    process.env.GOOGLE_CLIENT_ID = "id";
    expect(isCalendarConfigured()).toBe(false);
  });

  it("returns true when all three env vars are set", () => {
    process.env.GOOGLE_CLIENT_ID = "id";
    process.env.GOOGLE_CLIENT_SECRET = "secret";
    process.env.GOOGLE_REFRESH_TOKEN = "token";
    expect(isCalendarConfigured()).toBe(true);
  });
});

describe("getLondonUTCOffset", () => {
  it("returns 0 (GMT) for a January date", () => {
    expect(getLondonUTCOffset(new Date("2025-01-15T12:00:00Z"))).toBe(0);
  });

  it("returns 1 (BST) for a July date", () => {
    expect(getLondonUTCOffset(new Date("2025-07-15T12:00:00Z"))).toBe(1);
  });

  it("returns 0 (GMT) for a December date", () => {
    expect(getLondonUTCOffset(new Date("2025-12-01T12:00:00Z"))).toBe(0);
  });
});
