import { LANE_CAPACITY } from "@/lib/arena";

export const BUFFER_SECONDS = 45;
export const ACTIVE_LOOP_END_SECONDS = 8.5;
export const DISPUTE_FRAME_SECONDS = 9;
export type BroadcastPhase = "ACTIVE_LANE" | "DISPUTE";

/** Title metadata never owns pricing: prize baselines remain bracket-based. */
export const THEATRE_GAMES = {
  MW4: { name: "MODERN WARFARE 4", mode: "MULTIPLAYER", brackets: "6v6 · SOLO 1v1" },
  BO7: { name: "BLACK OPS 7", mode: "ZOMBIES", brackets: "SOLO SPEEDRUN · 4-PLAYER SQUADS" },
  SF6: { name: "STREET FIGHTER 6", mode: "FIGHTING", brackets: "SOLO · FIRST-TO-3" },
  FORTNITE: { name: "FORTNITE ARENA", mode: "BATTLE ROYALE", brackets: "ZERO-BUILD · 6v6" },
} as const;
export type TheatreGame = keyof typeof THEATRE_GAMES;

/** Crowdfunded prize baselines: 6v6/squad brackets at $600,000, solo brackets at $85,000. */
export const CROWDFUND_BASELINES = { team: 600_000, solo: 85_000 } as const;
export type BracketFormat = keyof typeof CROWDFUND_BASELINES;

/** Stage caption for a bracket format; keeps the displayed label and baseline in step. */
export function bracketFormatLabel(format: BracketFormat) {
  return format === "team" ? "6v6 TEAM TACTICAL" : "SOLO TACTICAL · 1v1";
}

/** Every prize pool amount is shown with this caption attached. */
export const CROWDFUND_BASELINE_CAPTION = "And Counting";

/** The dollar figure alone, so the caption can break onto its own line on narrow screens. */
export function crowdfundBaselineAmount(format: BracketFormat) {
  return `$${CROWDFUND_BASELINES[format].toLocaleString("en-US")}`;
}

/** Display caption for a bracket baseline; every prize pool amount reads "and counting". */
export function crowdfundBaselineLabel(format: BracketFormat) {
  return `${crowdfundBaselineAmount(format)} ${CROWDFUND_BASELINE_CAPTION}`;
}


export const BROADCAST_BASELINE = {
  format: "solo" as BracketFormat,
  prizePool: CROWDFUND_BASELINES.solo,
  registrationLimit: LANE_CAPACITY,
  source: "configured-baseline" as const,
};


export function hoverAudioState(isHovered: boolean) {
  return { isHovered, boostDb: isHovered ? 3 : 0 };
}

export const INITIAL_MATCH = {
  homePlayer: "PERSEUS", awayPlayer: "BETA_SLOT",
  homeScore: 5, awayScore: 3,
};

export function bufferAt(elapsedSeconds: number) {
  return BUFFER_SECONDS - (Math.max(0, Math.floor(elapsedSeconds)) % (BUFFER_SECONDS + 1));
}

export function videoCue(phase: BroadcastPhase, currentTime: number) {
  if (phase === "DISPUTE") return { seek: DISPUTE_FRAME_SECONDS, pause: true };
  return { seek: currentTime >= ACTIVE_LOOP_END_SECONDS ? 0 : null, pause: false };
}

export function parseScore(value: string) {
  if (!/^\d+$/.test(value.trim())) return null;
  const score = Number(value);
  return Number.isSafeInteger(score) ? score : null;
}