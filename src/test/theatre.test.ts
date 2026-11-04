import { describe, expect, it } from "vitest";
import { bufferAt, videoCue, parseScore, INITIAL_MATCH, BROADCAST_BASELINE, BRACKET_ROSTER_SIZES, THEATRE_GAMES, bracketFormatLabel, crowdfundBaselineLabel, hoverAudioState } from "@/lib/theatre";
import { PRIZE_PER_PERSON, prizePoolFor } from "@/lib/arena";

describe("Broadcast preview rules", () => {
  it("keeps title profiles separate from bracket-owned prize amounts", () => {
    expect(Object.keys(THEATRE_GAMES)).toEqual(["MW4", "BO7", "SF6", "FORTNITE"]);
    for (const profile of Object.values(THEATRE_GAMES)) {
      expect(profile).not.toHaveProperty("soloPool");
      expect(profile).not.toHaveProperty("teamPool");
    }
    expect(PRIZE_PER_PERSON).toBe(100000);
    expect(prizePoolFor(BRACKET_ROSTER_SIZES.solo)).toBe(100000);
    expect(prizePoolFor(BRACKET_ROSTER_SIZES.team)).toBe(600000);
  });
  it("starts the sample match at 5–3", () => {
    expect(INITIAL_MATCH.homeScore).toBe(5);
    expect(INITIAL_MATCH.awayScore).toBe(3);
  });
  it("pays $100,000 to every person on the winning side", () => {
    expect(prizePoolFor(1)).toBe(100000);
    expect(prizePoolFor(2)).toBe(200000);
    expect(prizePoolFor(4)).toBe(400000);
    expect(prizePoolFor(6)).toBe(600000);
    expect(prizePoolFor(5)).toBe(500000);
  });
  it("keeps team pools roster-sized rather than fixed", () => {
    expect(prizePoolFor(3)).toBe(300000);
    expect(prizePoolFor(8)).toBe(800000);
  });
  it("labels every prize pool amount as still counting", () => {
    expect(crowdfundBaselineLabel("team")).toBe("$600,000 And Counting");
    expect(crowdfundBaselineLabel("solo")).toBe("$100,000 And Counting");
  });
  it("shows the solo baseline on the sample 1v1 matchup without claiming live funding", () => {
    expect(BROADCAST_BASELINE.format).toBe("solo");
    expect(BROADCAST_BASELINE.prizePool).toBe(100000);
    expect(bracketFormatLabel(BROADCAST_BASELINE.format)).toBe("SOLO TACTICAL · 1v1");
    expect(BROADCAST_BASELINE.source).toBe("configured-baseline");
  });

  it("uses the shared 6,144-player registration limit", () => {
    expect(BROADCAST_BASELINE.registrationLimit).toBe(6144);
  });
  it("requests a +3dB hover boost and restores zero on leave", () => {
    expect(hoverAudioState(true)).toEqual({ isHovered: true, boostDb: 3 });
    expect(hoverAudioState(false)).toEqual({ isHovered: false, boostDb: 0 });
  });
  it("counts 45 seconds down to zero then resets to 45", () => {
    expect(bufferAt(0)).toBe(45);
    expect(bufferAt(1)).toBe(44);
    expect(bufferAt(45)).toBe(0);
    expect(bufferAt(46)).toBe(45);
  });
  it("holds the dispute frame at exactly 9 seconds", () => {
    expect(videoCue("DISPUTE", 2)).toEqual({ seek: 9, pause: true });
  });
  it("clamps normal playback at 8.5 seconds before the dispute window", () => {
    expect(videoCue("ACTIVE_LANE", 8.49).seek).toBeNull();
    expect(videoCue("ACTIVE_LANE", 8.5)).toEqual({ seek: 0, pause: false });
  });
  it("accepts only nonnegative whole-number sample scores", () => {
    expect(parseScore("12")).toBe(12);
    expect(parseScore("-1")).toBeNull();
    expect(parseScore("1.5")).toBeNull();
    expect(parseScore("")).toBeNull();
    expect(parseScore("9007199254740992")).toBeNull();
  });
});