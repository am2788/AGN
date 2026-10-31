import { describe, expect, it } from "vitest";
import { canCreateCustomAvatar, profileSchema, rankForPoints, ENGAGEMENT_POINTS, cosmeticUnlocks } from "@/lib/participant";
describe("participant reward security", () => {
  it("only permits custom avatars at 10,000 points", () => { expect(canCreateCustomAvatar(10000)).toBe(true); expect(canCreateCustomAvatar(9999)).toBe(false); });
  it.each([[0,"recruit"],[499,"recruit"],[500,"contender"],[1999,"contender"],[2000,"veteran"],[4999,"veteran"],[5000,"elite"],[9999,"elite"],[10000,"master"]])("maps %i points to %s", (points, rank) => { expect(rankForPoints(Number(points)).key).toBe(rank); });
  it("awards ten points per fifteen minutes of verified viewing", () => { expect(ENGAGEMENT_POINTS.stream_quarter).toBe(10); });
  it("awards 250 per tournament entry", () => { expect(ENGAGEMENT_POINTS.tournament_entry).toBe(250); });
  it("awards 50 per verified prediction or wager", () => { expect(ENGAGEMENT_POINTS.prediction).toBe(50); expect(ENGAGEMENT_POINTS.wager).toBe(50); });
  it("awards 100 per verified referral", () => { expect(ENGAGEMENT_POINTS.referral).toBe(100); });
  it("unlocks accents at Contender", () => { expect(cosmeticUnlocks(499).accents).toBe(false); expect(cosmeticUnlocks(500).accents).toBe(true); });
  it("unlocks typography at Veteran", () => { expect(cosmeticUnlocks(1999).typography).toBe(false); expect(cosmeticUnlocks(2000).typography).toBe(true); });
  it("unlocks animated rings at Elite", () => { expect(cosmeticUnlocks(4999).rings).toBe(false); expect(cosmeticUnlocks(5000).rings).toBe(true); });
  it("does not accept rewards through profile edits", () => { const result = profileSchema.parse({ display_name: "ACE", participant_type: "viewer", leaderboard_visible: true, avatar_key: "crest", points: 9999, rank_key: "master" }); expect(result).not.toHaveProperty("points"); expect(result).not.toHaveProperty("rank_key"); });
  it("supports both viewers and players", () => { for (const type of ["viewer", "player"]) expect(profileSchema.safeParse({ display_name: "ACE", participant_type: type, leaderboard_visible: false, avatar_key: "crest" }).success).toBe(true); });
});