import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUp, Globe2, Loader2, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askSchedule } from "@/lib/schedule-helper.functions";
import { validTimezone } from "@/lib/schedule-helper";

export function ScheduleHelper() {
  const ask = useServerFn(askSchedule);
  const [timezone, setTimezone] = useState("UTC");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof askSchedule>> | null>(null);
  useEffect(() => { setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"); }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !question.trim() || !validTimezone(timezone)) return;
    setBusy(true);
    setResult(null);
    try { setResult(await ask({ data: { question, timezone } })); }
    catch { setResult({ answer: "", events: [], error: "The schedule helper is unavailable. Please use the regional clocks." }); }
    finally { setBusy(false); }
  }
  return (
    <aside aria-label="Schedule helper" className="mb-6 border-y border-wager-line/50 bg-vault-bg py-5">
      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <div>
          <h3 className="flex items-center gap-2 font-display text-sm font-bold text-gold"><Clock3 className="size-4" /> Schedule helper</h3>
          <p className="mt-2 text-xs text-muted-foreground">Published schedule · Lovable AI</p>
          <label htmlFor="schedule-timezone" className="mt-4 flex items-center gap-2 text-xs text-foreground"><Globe2 className="size-3" /> Your timezone</label>
          <input id="schedule-timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} disabled={busy} className="mt-2 h-9 w-full rounded-sm border border-wager-line/50 bg-vault-panel px-3 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-crimson" aria-invalid={!validTimezone(timezone)} />
          {!validTimezone(timezone) && <p className="mt-1 text-xs text-amber-alert">Use a timezone such as America/New_York.</p>}
        </div>
        <div className="min-w-0">
          <form onSubmit={submit}>
            <label htmlFor="schedule-question" className="text-xs font-bold text-foreground">Ask about tournament timing</label>
            <div className="mt-2 flex items-end gap-2">
              <textarea id="schedule-question" placeholder="What time does the Europe segment start for me?" rows={2} maxLength={600} value={question} onChange={(event) => setQuestion(event.target.value)} disabled={busy} className="min-w-0 flex-1 resize-y rounded-sm border border-wager-line/50 bg-vault-panel p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-crimson" />
              <Button type="submit" size="icon" disabled={busy || !question.trim() || !validTimezone(timezone)} aria-label="Ask schedule helper" title="Ask schedule helper" className="mb-1 shrink-0 bg-crimson text-foreground hover:bg-crimson/80">{busy ? <Loader2 className="animate-spin" /> : <ArrowUp />}</Button>
            </div>
          </form>
          <div aria-live="polite" aria-busy={busy} className="mt-3 text-sm leading-relaxed">
            {busy && <p className="text-muted-foreground">Checking the published schedule…</p>}
            {result?.error && <p role="alert" className="text-amber-alert">{result.error}</p>}
            {result?.answer && <>
              <p className="whitespace-pre-wrap text-foreground">{result.answer}</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {result.events.map((event) => <div key={event.id} className="border-l-2 border-wager-line pl-3">
                  <dt className="text-xs font-bold text-gold">{event.label} · {event.kind}</dt>
                  <dd className="mt-1 text-sm font-bold text-foreground"><time dateTime={event.utcStart}>{event.localStart}</time></dd>
                  <dd className="mt-1 text-xs text-muted-foreground">{event.utcStart.replace("T", " ").replace(":00.000Z", " UTC")}{event.localEnd ? ` · Ends ${event.localEnd}` : ""}</dd>
                  {event.localCheckIn && <dd className="mt-1 text-xs text-gold">Air time &amp; check-in: {event.localCheckIn}</dd>}
                </div>)}
              </dl>
              <p className="mt-3 text-[10px] text-muted-foreground">Times shown in {timezone}. Scheduled windows do not confirm live matches.</p>
            </>}
          </div>
        </div>
      </div>
    </aside>
  );
}