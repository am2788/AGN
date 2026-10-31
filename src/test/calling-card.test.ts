import { describe, expect, it } from "vitest";
import { cardArtForPoints, cardLevelLabel, cardTag, isPrestigeMax, levelForPoints, MAX_LEVEL, POINTS_PER_LEVEL } from "@/lib/calling-card";

describe("calling card progression", () => {
  it("starts every participant at LVL 1", () => {
    expect(levelForPoints(0)).toBe(1);
  });

  it("grants one level per 200 engagement points", () => {
    expect(levelForPoints(POINTS_PER_LEVEL)).toBe(2);
    expect(levelForPoints(POINTS_PER_LEVEL * 9)).toBe(10);
  });

  it("caps the level display at 50", () => {
    expect(levelForPoints(POINTS_PER_LEVEL * 500)).toBe(MAX_LEVEL);
  });

  it("treats invalid point totals as LVL 1", () => {
    expect(levelForPoints(-50)).toBe(1);
    expect(levelForPoints(Number.NaN)).toBe(1);
  });

  it("shows PRESTIGE MAX only at Master rank (10,000+ points)", () => {
    expect(isPrestigeMax(9999)).toBe(false);
    expect(cardLevelLabel(9999)).toBe("LVL 50");
    expect(isPrestigeMax(10000)).toBe(true);
    expect(cardLevelLabel(10000)).toBe("PRESTIGE MAX");
  });

  it("labels the card tag with the participant's current rank", () => {
    expect(cardTag(0)).toBe("[RECRUIT]");
    expect(cardTag(500)).toBe("[CONTENDER]");
    expect(cardTag(2000)).toBe("[VETERAN]");
    expect(cardTag(5000)).toBe("[ELITE]");
    expect(cardTag(10000)).toBe("[MASTER]");
  });

  it("selects card art from the rank ladder", () => {
    expect(cardArtForPoints(0)).toBe("crimson");
    expect(cardArtForPoints(500)).toBe("cyan");
    expect(cardArtForPoints(2000)).toBe("gold");
    expect(cardArtForPoints(5000)).toBe("silver");
    expect(cardArtForPoints(10000)).toBe("gold");
  });
});
