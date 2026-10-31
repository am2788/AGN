import { describe, expect, it } from "vitest";
import { SPECTATOR_MIN_AGE, VOTE_CLOSES, seasonWeek, voteWindowOpen } from "@/lib/season-vote";

describe("seasonal title voting", () => {
  it("closes at the end of week 4 (21 Dec 2026 00:00 UTC)", () => {
    expect(new Date(VOTE_CLOSES).toISOString()).toBe("2026-12-21T00:00:00.000Z");
  });
  it("is open during week 4 and closed after", () => {
    expect(voteWindowOpen(Date.UTC(2026, 11, 20, 23, 59))).toBe(true);
    expect(voteWindowOpen(Date.UTC(2026, 11, 21, 0, 0))).toBe(false);
  });
  it("counts tournament weeks from 23 Nov", () => {
    expect(seasonWeek(Date.UTC(2026, 10, 22))).toBe(0);
    expect(seasonWeek(Date.UTC(2026, 10, 23))).toBe(1);
    expect(seasonWeek(Date.UTC(2026, 11, 20))).toBe(4);
  });
  it("spectators must be 13 or older", () => {
    expect(SPECTATOR_MIN_AGE).toBe(13);
  });
});
