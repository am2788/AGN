// Seasonal title voting. Votes stay open through week 4 of the seasonal
// tournaments, leaving a four-week window to prepare the next titles.
// The database enforces the same closing instant on every insert.
export const VOTE_SEASON = "2026-S1";
export const SEASON_START = Date.UTC(2026, 10, 23); // 23 Nov 2026 00:00 UTC
export const VOTE_WEEKS = 4;
export const VOTE_CLOSES = SEASON_START + VOTE_WEEKS * 7 * 24 * 60 * 60 * 1000; // 21 Dec 2026 00:00 UTC

export const VOTE_TITLES = [
  { id: "call-of-duty", label: "Call of Duty" },
  { id: "fortnite", label: "Fortnite" },
  { id: "street-fighter-6", label: "Street Fighter 6" },
  { id: "valorant", label: "VALORANT" },
  { id: "rocket-league", label: "Rocket League" },
  { id: "apex-legends", label: "Apex Legends" },
  { id: "tekken-8", label: "Tekken 8" },
  { id: "ea-sports-fc", label: "EA Sports FC" },
] as const;

export type VoteTitleId = (typeof VOTE_TITLES)[number]["id"];

export function voteWindowOpen(now: number) {
  return now < VOTE_CLOSES;
}

/** 1-based tournament week, or 0 before the season starts. */
export function seasonWeek(now: number) {
  if (now < SEASON_START) return 0;
  return Math.floor((now - SEASON_START) / (7 * 24 * 60 * 60 * 1000)) + 1;
}

export const SPECTATOR_MIN_AGE = 13;
