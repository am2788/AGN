import { RANKS, rankForPoints } from "./participant";

// Calling-card progression: 200 engagement points per level, capped at LVL 50.
// Master rank (10,000+ points) is displayed as the PRESTIGE MAX milestone.
export const POINTS_PER_LEVEL = 200;
export const MAX_LEVEL = 50;

export function levelForPoints(points: number): number {
  if (!Number.isFinite(points) || points < 0) return 1;
  return Math.min(MAX_LEVEL, Math.floor(points / POINTS_PER_LEVEL) + 1);
}

export function isPrestigeMax(points: number): boolean {
  return rankForPoints(points).key === "master";
}

export function cardLevelLabel(points: number): string {
  return isPrestigeMax(points) ? "PRESTIGE MAX" : `LVL ${levelForPoints(points)}`;
}

// The card's bracket tag shows the participant's current rank; no clan data exists yet.
export function cardTag(points: number): string {
  return `[${rankForPoints(points).name.toUpperCase()}]`;
}

export type CardArt = "crimson" | "cyan" | "gold" | "silver";

export function cardArtForPoints(points: number): CardArt {
  const rank = rankForPoints(points).key;
  if (rank === "master") return "gold";
  if (rank === "elite") return "silver";
  if (rank === "veteran") return "gold";
  if (rank === "contender") return "cyan";
  return "crimson";
}

export { RANKS };
