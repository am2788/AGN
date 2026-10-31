import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ARENA_DETAILS, LANE_CAPACITY, ARENA_LANES, ARENA_TAGLINES, ARENA_TITLES, DAILY_EPISODES_AT_CAPACITY, REGIONAL_SEGMENT_HOURS, MASTER_DEADLINE, REGION_HEADERS, PRELUDE_MINUTES, WEEKLY_ROTATION, THANKSGIVING_ROLLOUT, laneRegionalSchedule, regionalSegment, countdownSeconds, formatCountdown, formatLaneCountdown } from "@/lib/arena";
import covers from "@/assets/tournament-covers.jpg";
import { AgnCrest } from "@/components/agn-brand";
import { ScheduleHelper } from "@/components/schedule-helper";

export function ArenaPortal({ initialLane }: { initialLane?: number | undefined }) {
  const [now, setNow] = useState<number | null>(null);
  const remaining = now === null ? null : countdownSeconds(MASTER_DEADLINE, now);
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <section aria-label="Main Arena Portal" className="mb-16 w-full">
      <div className="mx-auto mb-6 w-full max-w-[352px] px-4">
        <AgnCrest prominent />
      </div>
      <div className="mb-10 text-center">
        <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase text-crimson">
          <Clock3 className="h-4 w-4" aria-hidden="true" /> Master Over-Clock
        </p>
        <div role="timer" aria-label="Countdown to October 21, 2026 at 00:00 UTC" className="arena-timer mx-auto mt-4 min-h-16 font-mono text-5xl font-bold leading-tight text-crimson sm:text-7xl">
          {remaining === null ? "--:--:--" : formatCountdown(remaining)}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Official site / trailer drop · Wednesday, October 21, 2026 · 00:00 UTC</p>
      </div>
      <div className="mb-4 border-b border-crimson/40 pb-3">
        <h2 className="font-display text-lg font-bold text-gold">AGN Global Tournament Schedule</h2>
        <p className="mt-1 text-xs text-muted-foreground">Asia (Tokyo) · Europe · Americas (EST) · November 23 regional launch · Daily {REGIONAL_SEGMENT_HOURS}-hour segments · All times anchored to UTC</p>
      </div>
      <ScheduleHelper />
      <div className="overflow-x-auto px-1 pb-6 pt-2">
        <Accordion type="multiple" defaultValue={initialLane ? [`lane-${initialLane}`] : []} aria-label="Competitive lanes" className="grid min-w-[900px] grid-cols-6 items-start gap-3">
          {ARENA_LANES.map((lane, index) => {
            const schedules = laneRegionalSchedule(lane);
            return (
            <AccordionItem key={lane} value={`lane-${lane}`} className="arena-border arena-matte min-w-0 overflow-hidden rounded-sm border-2 border-wager-line">
              <AccordionTrigger className="relative flex-col gap-0 p-0 hover:no-underline focus-visible:outline-2 focus-visible:outline-crimson [&>svg]:absolute [&>svg]:bottom-4 [&>svg]:right-3 [&>svg]:text-crimson">
                <span className={`arena-cover arena-cover-${lane} relative block w-full overflow-hidden`}>
                  <img src={covers} alt="" width={1536} height={1024} className="arena-cover-sheet" />
                  <span className="absolute left-3 top-3 bg-vault-bg/85 px-2 py-1 font-mono text-[10px] text-gold">LANE {String(lane).padStart(2, "0")}</span>
                </span>
                <span className="flex min-h-28 w-full items-start border-t border-crimson/60 px-3 pb-9 pt-4 text-left font-body text-sm font-bold leading-snug text-foreground">{ARENA_TITLES[index]}</span>
                {schedules.map((schedule) => {
                  const segment = now === null ? null : regionalSegment(schedule.startTime, now);
                  const seconds = segment === null || now === null ? null : countdownSeconds(segment.target, now);
                  return (
                <span key={schedule.region} className="block w-full border-t border-wager-line/60 bg-vault-bg px-3 py-4 text-left">
                  <span role="heading" aria-level={3} className="block text-xs font-bold text-gold">{REGION_HEADERS[schedule.region]}</span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">{segment?.inWindow ? "Segment ends in" : "Next segment starts in"}</span>
                  <time dateTime={schedule.startTime} className="mt-2 block text-[10px] text-foreground">{new Date(schedule.startTime).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" })} UTC</time>
                  <span role="timer" aria-label={`${ARENA_TITLES[index]} ${REGION_HEADERS[schedule.region]} countdown`} className="arena-timer mt-2 block min-h-8 break-words font-mono text-xs font-bold tabular-nums text-wager-line">{seconds === null ? "--d --:--:--" : formatLaneCountdown(seconds)}</span>
                  <span className="mt-1 block text-[10px] text-foreground/80">{schedule.localStart}</span>
                  <span className="mt-1 block text-[10px] text-gold">Air time &amp; check-in: {schedule.preludeUtc} ({PRELUDE_MINUTES}-min prelude)</span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">{schedule.utcWindow}</span>
                  {segment && segment.nextStart > Date.parse(schedule.startTime) && <span className="mt-1 block text-[10px] text-foreground/80">Next: {new Date(segment.nextStart).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" })} UTC</span>}
                </span>
                  );
                })}
                <span className="block w-full px-3 pb-4 text-left text-[10px] text-foreground">View Bracket &amp; Rules</span>
              </AccordionTrigger>
              <AccordionContent className="border-t border-crimson/60 px-3 pt-4">
                <p className="mb-2 text-xs text-foreground">{ARENA_TAGLINES[index]}</p>
                <p className="mb-3 text-xs text-gold">Three shared regional segments daily · {REGIONAL_SEGMENT_HOURS} hours each</p>
                {(() => { const d = ARENA_DETAILS[index]; if (!d) return null; return (
                  <dl className="mb-3 space-y-2 text-xs">
                    <div><dt className="text-[10px] uppercase text-muted-foreground">Title</dt><dd className="text-foreground">{d.game}</dd></div>
                    <div><dt className="text-[10px] uppercase text-muted-foreground">Structure</dt><dd className="text-foreground">{d.structure} · {LANE_CAPACITY.toLocaleString("en-US")} capacity</dd></div>
                    {"airDate" in d && <div><dd className="text-gold">{d.airDate}</dd></div>}
                    <div><dt className="text-[10px] uppercase text-muted-foreground">Format</dt><dd className="text-foreground">{d.format}</dd></div>
                  </dl>
                ); })()}
                <p className="text-[10px] uppercase text-muted-foreground">Awaiting lineup</p>
                <p className="mt-1 text-[10px] uppercase text-crimson">Entry closed</p>
              </AccordionContent>
            </AccordionItem>
          );})}
        </Accordion>
      </div>
      <p className="mt-2 border-t border-crimson/40 pt-4 text-xs leading-relaxed text-muted-foreground">
        <span className="font-bold text-gold">At full capacity: {DAILY_EPISODES_AT_CAPACITY} episodes per day, {REGIONAL_SEGMENT_HOURS} hours per segment</span> across Asia, Europe, and Americas, at the same regional times for every tournament mode each day. Air time begins {PRELUDE_MINUTES} minutes before each tournament start for check-in. Schedules are anchored to UTC. Cross-region East vs. West elimination showdowns transition to weekends as brackets merge.
      </p>
      <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
        <div><p className="font-bold text-gold">Normal week</p><ul className="mt-1 text-foreground">{WEEKLY_ROTATION.map((r) => <li key={r.day}>{r.day} · {r.title}</li>)}</ul></div>
        <div><p className="font-bold text-gold">Thanksgiving week 2026</p><ul className="mt-1 text-foreground">{THANKSGIVING_ROLLOUT.map((r) => <li key={r.date}>{r.date} · {r.title}</li>)}</ul></div>
      </div>
    </section>
  );
}
