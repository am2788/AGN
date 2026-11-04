import { describe, expect, it } from "vitest";
import { CARD_RULES, EMBLEM_SUBJECTS, MEDALS, emblemRule, evaluateRule, highestEmblemTier, sourceOf } from "@/lib/unlock-rules";

describe("unlock rules", () => {
  it("covers extended cards 51–93, 50 emblem subjects and 40 medals", () => {
    for (let n = 51; n <= 93; n++) expect(CARD_RULES[n]).toBeDefined();
    expect(EMBLEM_SUBJECTS).toHaveLength(50);
    expect(MEDALS).toHaveLength(40);
    expect(new Set(MEDALS.map((m) => m.key)).size).toBe(40);
  });

  it("classifies sources", () => {
    expect(sourceOf("points")).toBe("engagement");
    expect(sourceOf("kill_streak")).toBe("milestone");
    expect(sourceOf("titles_won")).toBe("achievement");
  });

  it("match rules fail closed without verified data", () => {
    expect(evaluateRule(CARD_RULES[73]!, { points: 99999 }).status).toBe("awaiting-data");
  });

  it("engagement rules unlock at the threshold", () => {
    expect(evaluateRule(CARD_RULES[51]!, { points: 499 }).status).toBe("locked");
    expect(evaluateRule(CARD_RULES[51]!, { points: 500 }).status).toBe("unlocked");
  });

  it("emblem tiers climb 1x/5x/15x/50x", () => {
    expect(emblemRule(8, "legendary")?.atLeast).toBe(250);
    expect(highestEmblemTier(8, { kill_streak: 25 })).toBe("silver");
    expect(highestEmblemTier(8, {})).toBeNull();
  });
});
