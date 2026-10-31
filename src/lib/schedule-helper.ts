import { z } from "zod";
import { MASTER_DEADLINE, PRELUDE_MINUTES, REGIONAL_SCHEDULE, REGION_HEADERS, REGIONAL_SEGMENT_HOURS, laneRegionalSchedule, regionalSegment } from "./arena";

const REGION_IDS = ["ASIA", "EU", "AMERICAS"] as const;
const PREFIXES = ["", "SOLOS_", "SF6_", "FORTNITE_"] as const;
export const SCHEDULE_EVENT_IDS = ["SITE", ...PREFIXES.flatMap((p) => REGION_IDS.flatMap((r) => [`${p}${r}_LAUNCH`, `${p}${r}_NEXT`]))] as [string, ...string[]];

export const scheduleAnswerSchema = z.object({
  answer: z.string(),
  eventIds: z.array(z.enum(SCHEDULE_EVENT_IDS)),
}).strict();

export function validTimezone(value: string) {
  try { new Intl.DateTimeFormat("en-GB", { timeZone: value }).format(); return value.length > 0; }
  catch { return false; }
}

export function localScheduleTime(timestamp: number, timezone: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: timezone, weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short" }).format(timestamp);
}

export function scheduleCatalog(now: number, timezone: string) {
  const site = { id: "SITE", label: "Site / trailer drop", start: MASTER_DEADLINE, end: null as number | null, kind: "Official launch" };
  const build = (prefix: string, labelPrefix: string, schedules: readonly { region: keyof typeof REGION_HEADERS; startTime: string }[]) =>
    schedules.flatMap((schedule) => {
      const first = Date.parse(schedule.startTime);
      const next = regionalSegment(schedule.startTime, now).nextStart;
      const label = `${labelPrefix}${REGION_HEADERS[schedule.region]}`;
      return [
        { id: `${prefix}${schedule.region}_LAUNCH`, label, start: first, end: first + REGIONAL_SEGMENT_HOURS * 3_600_000, kind: "First regional segment" },
        { id: `${prefix}${schedule.region}_NEXT`, label, start: next, end: next + REGIONAL_SEGMENT_HOURS * 3_600_000, kind: next <= now ? "Current scheduled window" : "Next scheduled segment" },
      ];
    });
  const events = [site, ...build("", "", REGIONAL_SCHEDULE), ...build("SOLOS_", "COD Multiplayer Solos · ", laneRegionalSchedule(2)), ...build("SF6_", "Street Fighter 6 · ", laneRegionalSchedule(6)), ...build("FORTNITE_", "Fortnite 6v6 Arena · ", laneRegionalSchedule(5))];
  return events.map((event) => ({
    ...event,
    utcStart: new Date(event.start).toISOString(),
    localStart: localScheduleTime(event.start, timezone),
    localEnd: event.end === null ? null : localScheduleTime(event.end, timezone),
    localCheckIn: event.end === null ? null : localScheduleTime(event.start - PRELUDE_MINUTES * 60_000, timezone),
  }));
}