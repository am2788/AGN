import { z } from "zod";
export const profileSchema = z.object({
  display_name: z.string().trim().min(1).max(32),
  participant_type: z.enum(["viewer", "player"]),
  leaderboard_visible: z.boolean(),
  avatar_key: z.enum(["crest", "shield", "swords"]),
  accent_key: z.enum(["crimson", "gold", "cyan", "silver"]).default("crimson"),
  font_key: z.enum(["body", "mono", "display", "scifi"]).default("body"),
});
export const RANKS = [{ key: "recruit", name: "Recruit", min: 0 }, { key: "contender", name: "Contender", min: 500 }, { key: "veteran", name: "Veteran", min: 2000 }, { key: "elite", name: "Elite", min: 5000 }, { key: "master", name: "Master", min: 10000 }] as const;
export const ENGAGEMENT_POINTS = { stream_quarter: 10, tournament_entry: 250, prediction: 50, wager: 50, referral: 100 } as const;
export function rankForPoints(points: number) { return [...RANKS].reverse().find((r) => points >= r.min) ?? RANKS[0]; }
export function canCreateCustomAvatar(points: number) { return points >= 10000; }
export function cosmeticUnlocks(points: number) { return { accents: points >= 500, typography: points >= 2000, rings: points >= 5000, forge: points >= 10000 }; }
export const RANK_STYLES: Record<string, string> = {
  recruit: "font-body text-foreground", contender: "font-body text-rank-silver", veteran: "font-scifi text-gold text-glow-gold", elite: "font-scifi text-rank-platinum text-glow-gold", master: "font-scifi font-bold text-rank-diamond text-glow-gold",
};
export const ACCENT_STYLES: Record<string, string> = { crimson: "text-crimson", gold: "text-gold", cyan: "text-rank-diamond", silver: "text-rank-silver" };
export const FONT_STYLES: Record<string, string> = { body: "font-body", mono: "font-mono", display: "font-display", scifi: "font-scifi" };