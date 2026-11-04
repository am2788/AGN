// Unlock rules for calling cards, emblems and medals.
//
// Three sources, each with its own trust level:
// - "engagement": counted from the server-only engagement ledger (verifiable today).
// - "milestone":  an in-match feat (streak, combo, flawless) — needs verified match data.
// - "achievement": a tournament / bracket result — needs verified bracket results.
// Rules only unlock from verified server totals; clients never submit stats.
// Until a verified match-data source exists, milestone and achievement rules
// report "awaiting-data" and never unlock (fail closed).
// Thresholds are launch drafts pending owner approval.

export type UnlockSource = "engagement" | "milestone" | "achievement";

export type StatKey =
  // engagement ledger
  | "points" | "stream_quarters" | "tournament_entries" | "predictions" | "referrals" | "overchat_days"
  // verified match data
  | "match_wins" | "win_streak" | "kill_streak" | "best_combo" | "flawless_rounds" | "hat_tricks"
  | "clutch_1v4" | "first_bloods" | "mvps" | "clean_sheets" | "comebacks" | "unbeaten_bracket"
  | "podiums" | "world_records"
  // verified bracket results
  | "bracket_stage" | "finals_reached" | "titles_won";

export const ENGAGEMENT_STATS: readonly StatKey[] = [
  "points", "stream_quarters", "tournament_entries", "predictions", "referrals", "overchat_days",
];

export type UnlockRule = { stat: StatKey; atLeast: number; label: string };

export function sourceOf(stat: StatKey): UnlockSource {
  if (ENGAGEMENT_STATS.includes(stat)) return "engagement";
  if (stat === "bracket_stage" || stat === "finals_reached" || stat === "titles_won") return "achievement";
  return "milestone";
}

/** Verified stats. Missing match keys mean no verified source exists yet. */
export type VerifiedStats = Partial<Record<StatKey, number>>;

export type UnlockStatus = "unlocked" | "locked" | "awaiting-data";

export function evaluateRule(rule: UnlockRule, stats: VerifiedStats): { status: UnlockStatus; progress: number } {
  const value = stats[rule.stat];
  if (value === undefined || !Number.isFinite(value)) {
    return { status: sourceOf(rule.stat) === "engagement" ? "locked" : "awaiting-data", progress: 0 };
  }
  const progress = Math.max(0, Math.min(1, value / rule.atLeast));
  return { status: value >= rule.atLeast ? "unlocked" : "locked", progress };
}

// ---------- Calling cards (extended set 51–93) ----------
export const CARD_RULES: Record<number, UnlockRule> = {
  51: { stat: "points", atLeast: 500, label: "Reach Contender (500 points)" },
  52: { stat: "stream_quarters", atLeast: 20, label: "Watch 5 hours of streams" },
  53: { stat: "match_wins", atLeast: 10, label: "Win 10 matches" },
  54: { stat: "tournament_entries", atLeast: 1, label: "Enter a squad-of-six bracket" },
  55: { stat: "titles_won", atLeast: 1, label: "Win a tournament title" },
  56: { stat: "unbeaten_bracket", atLeast: 1, label: "Finish a bracket with no losses" },
  57: { stat: "overchat_days", atLeast: 7, label: "Chat in Overchat on 7 days" },
  58: { stat: "comebacks", atLeast: 1, label: "Win a final round from behind" },
  59: { stat: "match_wins", atLeast: 25, label: "Win 25 matches" },
  60: { stat: "titles_won", atLeast: 1, label: "Win the Grand Finals" },
  61: { stat: "finals_reached", atLeast: 1, label: "Reach a final" },
  62: { stat: "bracket_stage", atLeast: 3, label: "Reach the semifinals" },
  63: { stat: "predictions", atLeast: 10, label: "Make 10 match predictions" },
  64: { stat: "titles_won", atLeast: 3, label: "Win 3 tournament titles" },
  65: { stat: "win_streak", atLeast: 10, label: "Win 10 matches in a row" },
  66: { stat: "stream_quarters", atLeast: 40, label: "Watch 10 hours of streams" },
  67: { stat: "match_wins", atLeast: 5, label: "Win 5 matches" },
  68: { stat: "overchat_days", atLeast: 3, label: "Chat in Overchat on 3 days" },
  69: { stat: "first_bloods", atLeast: 5, label: "Get first blood 5 times" },
  70: { stat: "comebacks", atLeast: 3, label: "Win 3 matches from behind" },
  71: { stat: "tournament_entries", atLeast: 1, label: "Enter your first tournament" },
  72: { stat: "win_streak", atLeast: 3, label: "Win 3 matches in a row" },
  73: { stat: "kill_streak", atLeast: 5, label: "5-kill streak" },
  74: { stat: "best_combo", atLeast: 15, label: "Land a 15-hit combo" },
  75: { stat: "hat_tricks", atLeast: 1, label: "Score a hat-trick" },
  76: { stat: "flawless_rounds", atLeast: 1, label: "Win a round without losing health" },
  77: { stat: "clutch_1v4", atLeast: 1, label: "Win a 1v4 clutch" },
  78: { stat: "first_bloods", atLeast: 1, label: "Get first blood" },
  79: { stat: "mvps", atLeast: 1, label: "Earn match MVP" },
  80: { stat: "clean_sheets", atLeast: 1, label: "Keep a clean sheet" },
  81: { stat: "comebacks", atLeast: 1, label: "Win a match from behind" },
  82: { stat: "match_wins", atLeast: 3, label: "Win 3 races" },
  83: { stat: "stream_quarters", atLeast: 8, label: "Watch 2 hours of streams" },
  84: { stat: "podiums", atLeast: 3, label: "Finish on the podium 3 times" },
  85: { stat: "match_wins", atLeast: 1, label: "Win a match" },
  86: { stat: "predictions", atLeast: 3, label: "Make 3 match predictions" },
  87: { stat: "overchat_days", atLeast: 1, label: "Post in Overchat" },
  88: { stat: "world_records", atLeast: 1, label: "Set a verified world record" },
  89: { stat: "bracket_stage", atLeast: 1, label: "Clear the first bracket round" },
  90: { stat: "referrals", atLeast: 1, label: "Refer a friend who joins" },
  91: { stat: "flawless_rounds", atLeast: 3, label: "Win 3 flawless rounds" },
  92: { stat: "referrals", atLeast: 5, label: "Refer 5 friends who join" },
  93: { stat: "points", atLeast: 5000, label: "Reach Elite (5,000 points)" },
};

// ---------- Emblems: 50 subjects × 4 tiers ----------
// Each subject is tied to one stat; tiers climb Bronze → Silver → Gold → Legendary.
export const EMBLEM_TIERS = ["bronze", "silver", "gold", "legendary"] as const;
export type EmblemTier = (typeof EMBLEM_TIERS)[number];
export const EMBLEM_TIER_MULTIPLIER: Record<EmblemTier, number> = { bronze: 1, silver: 5, gold: 15, legendary: 50 };

export const EMBLEM_SUBJECTS: readonly { n: number; name: string; stat: StatKey; base: number }[] = [
  { n: 1, name: "Wolf Head", stat: "win_streak", base: 3 },
  { n: 2, name: "Lion Head", stat: "match_wins", base: 10 },
  { n: 3, name: "Eagle Spread", stat: "stream_quarters", base: 8 },
  { n: 4, name: "Dragon Head", stat: "titles_won", base: 1 },
  { n: 5, name: "Phoenix", stat: "comebacks", base: 1 },
  { n: 6, name: "Coiled Serpent", stat: "clutch_1v4", base: 1 },
  { n: 7, name: "Bear Head", stat: "clean_sheets", base: 1 },
  { n: 8, name: "Shark", stat: "kill_streak", base: 5 },
  { n: 9, name: "Scorpion", stat: "first_bloods", base: 1 },
  { n: 10, name: "Raven", stat: "overchat_days", base: 3 },
  { n: 11, name: "Crossed Blades", stat: "match_wins", base: 5 },
  { n: 12, name: "Crosshair Reticle", stat: "kill_streak", base: 3 },
  { n: 13, name: "Clenched Gauntlet", stat: "best_combo", base: 10 },
  { n: 14, name: "Arcade Fight Stick", stat: "best_combo", base: 15 },
  { n: 15, name: "Football", stat: "hat_tricks", base: 1 },
  { n: 16, name: "Goal Net With Ball", stat: "clean_sheets", base: 2 },
  { n: 17, name: "Racing Helmet", stat: "podiums", base: 1 },
  { n: 18, name: "Racing Wheel", stat: "match_wins", base: 3 },
  { n: 19, name: "Speedrun Stopwatch", stat: "world_records", base: 1 },
  { n: 20, name: "Gas Mask", stat: "flawless_rounds", base: 1 },
  { n: 21, name: "Puzzle Cube", stat: "predictions", base: 5 },
  { n: 22, name: "Rhythm Pulse Note", stat: "best_combo", base: 20 },
  { n: 23, name: "Three-Lane Tower", stat: "bracket_stage", base: 1 },
  { n: 24, name: "Chess Knight", stat: "predictions", base: 10 },
  { n: 25, name: "Game Controller", stat: "tournament_entries", base: 1 },
  { n: 26, name: "Gaming Headset", stat: "stream_quarters", base: 20 },
  { n: 27, name: "Skull", stat: "kill_streak", base: 10 },
  { n: 28, name: "Rising Zombie Hand", stat: "comebacks", base: 2 },
  { n: 29, name: "Lightning Bolt", stat: "first_bloods", base: 3 },
  { n: 30, name: "Flame", stat: "win_streak", base: 5 },
  { n: 31, name: "Comet", stat: "points", base: 500 },
  { n: 32, name: "Crown", stat: "titles_won", base: 1 },
  { n: 33, name: "Trophy Cup", stat: "finals_reached", base: 1 },
  { n: 34, name: "Laurel Wreath", stat: "mvps", base: 1 },
  { n: 35, name: "Heater Shield", stat: "unbeaten_bracket", base: 1 },
  { n: 36, name: "Hourglass", stat: "stream_quarters", base: 40 },
  { n: 37, name: "Six-Segment Ring", stat: "tournament_entries", base: 6 },
  { n: 38, name: "Bracket Tree", stat: "bracket_stage", base: 2 },
  { n: 39, name: "Wireframe Globe", stat: "referrals", base: 1 },
  { n: 40, name: "Gateway Arch", stat: "predictions", base: 3 },
  { n: 41, name: "Twin Shields", stat: "referrals", base: 2 },
  { n: 42, name: "Triple Chevron", stat: "win_streak", base: 3 },
  { n: 43, name: "Five-Point Star", stat: "mvps", base: 3 },
  { n: 44, name: "Faceted Diamond", stat: "points", base: 2000 },
  { n: 45, name: "War Hammer", stat: "match_wins", base: 25 },
  { n: 46, name: "Spartan-Style Helm", stat: "clutch_1v4", base: 2 },
  { n: 47, name: "Owl", stat: "overchat_days", base: 7 },
  { n: 48, name: "Mech Head", stat: "kill_streak", base: 7 },
  { n: 49, name: "Winged Boot", stat: "podiums", base: 3 },
  { n: 50, name: "Infinity Knot", stat: "points", base: 1000 },
];

export function emblemRule(n: number, tier: EmblemTier): UnlockRule | undefined {
  const s = EMBLEM_SUBJECTS.find((e) => e.n === n);
  if (!s) return undefined;
  const atLeast = s.base * EMBLEM_TIER_MULTIPLIER[tier];
  return { stat: s.stat, atLeast, label: `${s.name} (${tier}) — ${s.stat.replace(/_/g, " ")} ${atLeast}` };
}

/** Highest earned tier for a subject, or null. Used to shrink the emblem into the calling card. */
export function highestEmblemTier(n: number, stats: VerifiedStats): EmblemTier | null {
  let best: EmblemTier | null = null;
  for (const tier of EMBLEM_TIERS) {
    const rule = emblemRule(n, tier);
    if (rule && evaluateRule(rule, stats).status === "unlocked") best = tier;
  }
  return best;
}

// ---------- Medals (40) ----------
export const MEDALS: readonly ({ key: string; name: string } & UnlockRule)[] = [
  // Engagement (14)
  { key: "first-watch", name: "First Watch", stat: "stream_quarters", atLeast: 1, label: "Watch 15 minutes of a stream" },
  { key: "binge", name: "Binge Watcher", stat: "stream_quarters", atLeast: 40, label: "Watch 10 hours" },
  { key: "marathon", name: "Marathon", stat: "stream_quarters", atLeast: 200, label: "Watch 50 hours" },
  { key: "first-call", name: "First Call", stat: "predictions", atLeast: 1, label: "Make a prediction" },
  { key: "oracle", name: "Oracle", stat: "predictions", atLeast: 25, label: "Make 25 predictions" },
  { key: "recruiter", name: "Recruiter", stat: "referrals", atLeast: 1, label: "Refer a friend" },
  { key: "ambassador", name: "Ambassador", stat: "referrals", atLeast: 10, label: "Refer 10 friends" },
  { key: "voice", name: "Voice of the Arena", stat: "overchat_days", atLeast: 1, label: "Post in Overchat" },
  { key: "regular", name: "Regular", stat: "overchat_days", atLeast: 30, label: "Chat on 30 days" },
  { key: "entrant", name: "Entrant", stat: "tournament_entries", atLeast: 1, label: "Enter a tournament" },
  { key: "contender", name: "Contender", stat: "points", atLeast: 500, label: "Reach 500 points" },
  { key: "veteran", name: "Veteran", stat: "points", atLeast: 2000, label: "Reach 2,000 points" },
  { key: "elite", name: "Elite", stat: "points", atLeast: 5000, label: "Reach 5,000 points" },
  { key: "master", name: "Master", stat: "points", atLeast: 10000, label: "Reach 10,000 points" },
  // Milestones (18)
  { key: "first-win", name: "First Win", stat: "match_wins", atLeast: 1, label: "Win a match" },
  { key: "centurion", name: "Centurion", stat: "match_wins", atLeast: 100, label: "Win 100 matches" },
  { key: "hot-streak", name: "Hot Streak", stat: "win_streak", atLeast: 3, label: "Win 3 in a row" },
  { key: "unstoppable", name: "Unstoppable", stat: "win_streak", atLeast: 10, label: "Win 10 in a row" },
  { key: "killstreak-5", name: "Rampage", stat: "kill_streak", atLeast: 5, label: "5-kill streak" },
  { key: "killstreak-10", name: "Annihilator", stat: "kill_streak", atLeast: 10, label: "10-kill streak" },
  { key: "combo-15", name: "Combo Artist", stat: "best_combo", atLeast: 15, label: "15-hit combo" },
  { key: "combo-30", name: "Combo King", stat: "best_combo", atLeast: 30, label: "30-hit combo" },
  { key: "flawless", name: "Flawless", stat: "flawless_rounds", atLeast: 1, label: "Win a flawless round" },
  { key: "untouchable", name: "Untouchable", stat: "flawless_rounds", atLeast: 10, label: "Win 10 flawless rounds" },
  { key: "hat-trick", name: "Hat-Trick", stat: "hat_tricks", atLeast: 1, label: "Score a hat-trick" },
  { key: "clutch", name: "Clutch", stat: "clutch_1v4", atLeast: 1, label: "Win a 1v4" },
  { key: "first-blood", name: "First Blood", stat: "first_bloods", atLeast: 1, label: "Get first blood" },
  { key: "mvp", name: "MVP", stat: "mvps", atLeast: 1, label: "Earn match MVP" },
  { key: "wall", name: "The Wall", stat: "clean_sheets", atLeast: 1, label: "Keep a clean sheet" },
  { key: "comeback", name: "Comeback", stat: "comebacks", atLeast: 1, label: "Win from behind" },
  { key: "podium", name: "Podium", stat: "podiums", atLeast: 1, label: "Finish on the podium" },
  { key: "record", name: "Record Breaker", stat: "world_records", atLeast: 1, label: "Set a verified record" },
  // Achievements (8)
  { key: "round-one", name: "Round One Cleared", stat: "bracket_stage", atLeast: 1, label: "Clear the first bracket round" },
  { key: "quarterfinalist", name: "Quarterfinalist", stat: "bracket_stage", atLeast: 2, label: "Reach the quarterfinals" },
  { key: "semifinalist", name: "Semifinalist", stat: "bracket_stage", atLeast: 3, label: "Reach the semifinals" },
  { key: "finalist", name: "Finalist", stat: "finals_reached", atLeast: 1, label: "Reach a final" },
  { key: "no-losses", name: "Perfect Run", stat: "unbeaten_bracket", atLeast: 1, label: "Finish a bracket with no losses" },
  { key: "champion", name: "Champion", stat: "titles_won", atLeast: 1, label: "Win a tournament" },
  { key: "dynasty", name: "Dynasty", stat: "titles_won", atLeast: 3, label: "Win 3 tournaments" },
  { key: "legend", name: "Legend", stat: "titles_won", atLeast: 10, label: "Win 10 tournaments" },
];
