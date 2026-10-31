import { describe, expect, it } from "vitest";
import { arenaClock, nextArenaStart } from "@/lib/arena-shell";
describe("Arena schedule clock", () => {
  it("uses the November 23 noon UTC launch rather than a sample countdown", () => {
    expect(nextArenaStart(Date.parse("2026-10-29T03:20:00Z"))).toBe(Date.parse("2026-11-23T12:00:00Z"));
  });
  it("counts actual days hours minutes and seconds", () => {
    expect(arenaClock(Date.parse("2026-11-22T10:30:15Z"))).toEqual(["01", "01", "29", "45"]);
  });
  it("shows unavailable once every supplied start has passed", () => {
    expect(arenaClock(Date.parse("2027-01-01T00:00:00Z"))).toEqual(["--", "--", "--", "--"]);
  });
});