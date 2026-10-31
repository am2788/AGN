import { LANES_SCHEDULE, countdownSeconds } from "@/lib/arena";

export const ARENA_VIEWS = [
  { slug: "", label: "Command Center" }, { slug: "prize-pools", label: "Prize Pools & Wagers" },
  { slug: "system-status", label: "System Status" }, { slug: "schedule", label: "Schedule" },
  { slug: "tournaments", label: "Tournaments" }, { slug: "leaderboard", label: "Leaderboard" },
  { slug: "watch", label: "Watch" }, { slug: "teams", label: "Teams" },
  { slug: "news", label: "News" }, { slug: "vote", label: "Vote" },
  { slug: "chat", label: "Chat" }, { slug: "settings", label: "Settings" },
] as const;

export function nextArenaStart(now: number) {
  const starts = LANES_SCHEDULE.map((s) => Date.parse(s.startTime)).filter((start) => start > now);
  return starts.length ? Math.min(...starts) : null;
}
export function arenaClock(now: number | null) {
  const target = now === null ? null : nextArenaStart(now);
  if (now === null || target === null) return ["--", "--", "--", "--"];
  const seconds = countdownSeconds(target, now);
  return [Math.floor(seconds / 86400), Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map((part) => String(part).padStart(2, "0"));
}