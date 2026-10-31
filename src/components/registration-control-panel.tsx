import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ARENA_LANES, ARENA_TITLES, LANE_CAPACITY, LANE_TEAM_SIZES, filledSlots, laneSlotCapacity } from "@/lib/arena";
import { REGISTRATION_STATUSES, capacityPercent, type RegistrationStatus } from "@/lib/registration-control";
import { getRegistrationControl, setRegistrationStatus } from "@/lib/registration-control.functions";

const STATUS_COPY: Record<RegistrationStatus, string> = {
  OPEN: "Players can save new entries.",
  PAUSED: "New entries are temporarily blocked.",
  CLOSED: "New entries are locked.",
};

export function RegistrationControlPanel() {
  const read = useServerFn(getRegistrationControl);
  const write = useServerFn(setRegistrationStatus);
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["admin-registration-control"], queryFn: () => read(), retry: false });
  const mutation = useMutation({
    mutationFn: (status: RegistrationStatus) => write({ data: { status } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-registration-control"] }),
  });

  if (query.isPending) return <p role="status" className="text-muted-foreground">Loading registration controls…</p>;
  if (query.error) return <div><p role="alert">{query.error.message}</p><Button className="mt-3" onClick={() => void query.refetch()}>Retry</Button></div>;
  const { status, updatedAt, laneCounts, log } = query.data;
  const counts = new Map(laneCounts.map((c) => [c.lane, c.entries]));

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <h2 className="text-lg font-semibold">Saved entries per lane</h2>
        <p className="mt-1 text-xs text-muted-foreground">Real saved registrations against the {LANE_CAPACITY.toLocaleString("en-US")} lane capacity. Payment and identity checks are separate.</p>
        <div className="mt-5 space-y-4 font-mono">
          {ARENA_LANES.map((lane, i) => {
            const entries = counts.get(lane) ?? 0;
            const size = LANE_TEAM_SIZES[i];
            const slots = laneSlotCapacity(i);
            return (
              <div key={lane}>
                <div className="flex justify-between gap-3 text-xs"><span className="text-muted-foreground">{ARENA_TITLES[i]} · {size === 1 ? "Solo" : `${size}-player teams`}</span><span>{entries.toLocaleString("en-US")} <span className="text-muted-foreground">/ {LANE_CAPACITY.toLocaleString("en-US")} players</span></span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full border border-border bg-background">
                  <div className="h-full bg-wager-line transition-all duration-500" style={{ width: `${capacityPercent(entries, LANE_CAPACITY)}%` }} />
                </div>
                <p className="mt-1 text-right text-[11px] text-muted-foreground">Bracket slots {filledSlots(entries, i).toLocaleString("en-US")} / {slots.toLocaleString("en-US")}</p>
              </div>
            );
          })}
        </div>
        <h3 className="mt-8 text-sm font-semibold">Status change history</h3>
        <div className="mt-2 h-40 overflow-y-auto rounded-sm border border-border bg-background p-3 font-mono text-[11px] text-muted-foreground">
          {log.length === 0 ? <p>No status changes yet.</p> : log.map((e, i) => (
            <div key={e.id} className="border-b border-border/40 pb-1.5 mb-1.5 last:border-0">
              <div className="flex justify-between gap-2"><span className="text-gold">{log[i + 1]?.status ?? "START"} → {e.status}</span><span>{new Date(e.changed_at).toLocaleString()}</span></div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Registration status</h2>
        <p className="mt-1 text-xs text-muted-foreground">Now: <span className="font-bold text-gold">{status}</span>{updatedAt && ` · changed ${new Date(updatedAt).toLocaleString()}`}</p>
        <div className="mt-4 flex flex-col gap-2">
          {REGISTRATION_STATUSES.map((s) => (
            <Button key={s} variant={status === s ? "default" : "outline"} disabled={mutation.isPending || status === s} onClick={() => mutation.mutate(s)} className="justify-start">
              Set {s}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{STATUS_COPY[status]}</p>
        {mutation.error && <p role="alert" className="mt-2 text-xs text-crimson">{mutation.error.message}</p>}
      </section>
    </div>
  );
}
