export const ARENA_LANES = [1, 2, 3, 4, 5, 6] as const;

// Date-only schedule defaults to the beginning of the supplied day in UTC.
export const MASTER_DEADLINE = Date.parse("2026-10-21T00:00:00Z");
export const DAILY_EPISODES_AT_CAPACITY = 3;
export const REGIONAL_SEGMENT_HOURS = 3;
export const REGION_HEADERS = {
  ASIA: "ASIA (Tokyo)",
  EU: "EUROPE",
  AMERICAS: "AMERICAS (EST)",
} as const;
export const ARENA_TITLES = [
  "COD MULTIPLAYER TEAMS",
  "COD MULTIPLAYER SOLOS",
  "COD ZOMBIES MODE 01",
  "COD ZOMBIES MODE 02",
  "FORTNITE 6V6 ARENA",
  "STREET FIGHTER 6",
] as const;
export const ARENA_TAGLINES = [
  "Tactical squad deployment & multiplayer brackets",
  "Lone operator skull visor showdown",
  "Undead containment lab speedrun",
  "Scorched earth survival brackets",
  "6v6 arena sci-fi sky beam clash",
  "Dojo showdown bracket",
] as const;
export const LANE_CAPACITY = 6144;
/** Players per bracket slot, in ARENA_LANES order: Teams 6, Solos 1, Zombies 01 solo 1, Zombies 02 squads 4, Fortnite 6, SF6 1. */
export const LANE_TEAM_SIZES = [6, 1, 1, 4, 6, 1] as const;
/** Bracket slots per lane: 6,144 players divided by team size. */
export function laneSlotCapacity(index: number): number {
  return LANE_CAPACITY / LANE_TEAM_SIZES[index]!;
}
/** Filled bracket slots: only complete teams count. */
export function filledSlots(players: number, index: number): number {
  return Math.floor(players / LANE_TEAM_SIZES[index]!);
}
export const ARENA_DETAILS = [
  { game: "MW4 (Multiplayer Tactical)", structure: "6v6 Team Brackets", format: "Hardpoint & Search and Destroy (Bo5 Series) with AI Referee loadout verification." },
  { game: "MW4 (Solo Tactical)", structure: "Solo Brackets", airDate: "Air date: November 27 (Day 4 holiday rollout)", format: "Gunfight / Custom 1v1 tactical arenas (First to 10 rounds)." },
  { game: "Black Ops 7 (BO7) (Zombies Co-Op / Competitive)", structure: "Team Brackets", format: "Easter Egg / Main Quest extraction speedrun (strict 45-minute timer and essence down penalties)." },
  { game: "Black Ops 7 (BO7) (Zombies Co-Op / Competitive)", structure: "Team Brackets", format: "Pure round-based survival ladder on parallel seed servers." },
  { game: "Fortnite (Zero-Build / Competitive)", structure: "6v6 Team Brackets", format: "Dynamic storm surge with accelerated closing horizons." },
  { game: "Street Fighter 6 (FGC Classic)", structure: "Solo Brackets", format: "First-to-3 Set, double-elimination classic tournament bracket." },
] as const;

export interface TournamentLane {
  id: string;
  lane: (typeof ARENA_LANES)[number];
  title: string;
  region: keyof typeof REGION_HEADERS;
  startTime: string;
  status: "UPCOMING" | "LIVE" | "CONCLUDED";
}

export const REGIONAL_SCHEDULE = [
  { region: "ASIA", startTime: "2026-11-23T12:00:00Z", localStart: "23 Nov · 21:00 JST", utcWindow: "12:00–15:00 UTC daily" },
  { region: "EU", startTime: "2026-11-23T20:00:00Z", localStart: "23 Nov · 20:00 UTC", utcWindow: "20:00–23:00 UTC daily" },
  { region: "AMERICAS", startTime: "2026-11-24T02:00:00Z", localStart: "23 Nov · 21:00 EST", utcWindow: "02:00–05:00 UTC daily" },
] as const;

/** Air time / check-in prelude opens this many minutes before each tournament start. */
export const PRELUDE_MINUTES = 15;
/** Lanes whose regional clocks start later than Nov 23; same regional times and windows. */
export const LANE_START_DAY_OFFSET: Partial<Record<(typeof ARENA_LANES)[number], number>> = { 2: 4, 5: 2, 6: 1 };
export const WEEKLY_ROTATION = [
  { day: "Monday", title: "COD MULTIPLAYER TEAMS" },
  { day: "Thursday", title: "COD MULTIPLAYER SOLOS" },
  { day: "Friday", title: "STREET FIGHTER 6" },
  { day: "Saturday", title: "FORTNITE 6V6 ARENA" },
] as const;
export const THANKSGIVING_ROLLOUT = [
  { date: "Mon, Nov 23", title: "COD MULTIPLAYER TEAMS" },
  { date: "Fri, Nov 27", title: "COD MULTIPLAYER SOLOS" },
  { date: "Sat, Nov 28", title: "STREET FIGHTER 6" },
  { date: "Sun, Nov 29", title: "FORTNITE 6V6 ARENA" },
] as const;

const DAY_MS = 86_400_000;
const utcHm = (t: number) => new Date(t).toISOString().slice(11, 16);

export function laneRegionalSchedule(lane: (typeof ARENA_LANES)[number]) {
  const offset = (LANE_START_DAY_OFFSET[lane] ?? 0) * DAY_MS;
  return REGIONAL_SCHEDULE.map((s) => {
    const start = Date.parse(s.startTime) + offset;
    const startTime = new Date(start).toISOString().replace(".000Z", "Z");
    const localStart = offset === 0 ? s.localStart : s.localStart.replace(/^\d{2} Nov/, new Date(start - (s.region === "AMERICAS" ? 5 * 3_600_000 : s.region === "ASIA" ? -9 * 3_600_000 : 0)).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }));
    return { ...s, startTime, localStart, preludeUtc: `${utcHm(start - PRELUDE_MINUTES * 60_000)} UTC` };
  });
}

export const LANES_SCHEDULE: readonly TournamentLane[] = ARENA_LANES.flatMap((lane, index) =>
  laneRegionalSchedule(lane).map((schedule) => ({
    id: `lane-${lane}-${schedule.region.toLowerCase()}`,
    lane,
    title: `${ARENA_TITLES[index]} · ${REGION_HEADERS[schedule.region]}`,
    region: schedule.region,
    startTime: schedule.startTime,
    status: "UPCOMING" as const,
  })),
);

/** Fixed UTC daily recurrence; an active time window is not a verified live match. */
export function regionalSegment(startTime: string, now: number) {
  const firstStart = Date.parse(startTime);
  const day = 86_400_000;
  const duration = REGIONAL_SEGMENT_HOURS * 3_600_000;
  const elapsedDays = Math.max(0, Math.floor((now - firstStart) / day));
  const todayStart = firstStart + elapsedDays * day;
  const inWindow = now >= todayStart && now < todayStart + duration;
  const nextStart = now < todayStart ? todayStart : inWindow ? todayStart : todayStart + day;
  return {
    inWindow,
    nextStart,
    target: inWindow ? todayStart + duration : nextStart,
  };
}

export function formatLaneCountdown(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  return `${days}d ${formatCountdown(seconds % 86400)}`;
}

export function countdownSeconds(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function formatCountdown(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return [hours, minutes, remainder].map((value) => String(value).padStart(2, "0")).join(":");
}
export const WAGER_TIERS = [
  { id: "recruit", label: "Recruit", feeCents: 500 },
  { id: "contender", label: "Contender", feeCents: 2500 },
  { id: "veteran", label: "Veteran", feeCents: 10000 },
  { id: "elite", label: "Elite", feeCents: 25000 },
] as const;
export type WagerTierId = (typeof WAGER_TIERS)[number]["id"];

/** Pot = fee x 2; winner gets 80%, grand finals vault gets 20%. Cents avoid float drift. */
export function wagerSplit(feeCents: number) {
  const pot = feeCents * 2;
  const prizeCents = Math.round(pot * 0.8);
  return { prizeCents, vaultCents: pot - prizeCents };
}

export const formatUsd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export const WAGER_STEPS = [
  {
    id: 1,
    title: "Select active matchup",
    instruction: "Pick one of the six competitive lanes.",
  },
  {
    id: 2,
    title: "Choose tier",
    instruction: "Recruit $5, Contender $25, Veteran $100, Elite $250.",
  },
  {
    id: 3,
    title: "Confirm 18+ ID verification status",
    instruction: "Tick the box to confirm your 18+ ID status, then lock in.",
  },
] as const;

export const WAGERING_RULES = [
  "All match results are reviewed and verified before payout is settled.",
  "Tiers are Recruit $5, Contender $25, Veteran $100, Elite $250.",
  "Pot is entry x 2: winner takes 80%, the grand finals vault takes 20%.",
  "Real age and ID verification is required before any paid wager.",
] as const;
