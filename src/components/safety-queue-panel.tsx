import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { listSafetyFlags, reviewSafetyFlag } from "@/lib/social.functions";

// Human-in-the-loop: nothing is banned or reported until an admin decides.
export function SafetyQueuePanel() {
  const qc = useQueryClient();
  const read = useServerFn(listSafetyFlags);
  const review = useServerFn(reviewSafetyFlag);
  const q = useQuery({ queryKey: ["safety-flags"], queryFn: () => read(), refetchInterval: 30000 });
  const decide = useMutation({
    mutationFn: (v: { id: string; decision: "dismissed" | "banned" }) => review({ data: v }),
    onSuccess: (_r, v) => { toast.success(v.decision === "banned" ? "Banned — report queued" : "Dismissed"); qc.invalidateQueries({ queryKey: ["safety-flags"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const flags = q.data?.flags ?? [];
  const pending = flags.filter((f) => f.status === "pending");
  return <div>
    <h2 className="text-lg font-semibold">Safety queue <span className="ml-2 font-mono text-crimson">{pending.length}</span></h2>
    <p className="mt-1 text-xs text-muted-foreground">Held messages. Banning removes the account permanently and queues an authority report with the saved device fingerprint.</p>
    {q.isPending ? <p className="mt-4 text-sm text-muted-foreground">Loading…</p> : pending.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Nothing waiting for review.</p> :
      <ul className="mt-4 divide-y divide-border">{pending.map((f) => {
        const fp = (f.fingerprint ?? {}) as Record<string, string | null>;
        return <li key={f.id} className="py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs"><span className={f.severity === "high" ? "text-crimson" : "text-gold"}>{f.category.toUpperCase()} · {f.severity}</span><span className="text-muted-foreground">{new Date(f.created_at).toLocaleString()}</span></div>
          <p className="mt-2 border-l-2 border-crimson pl-3 text-sm">{f.body}</p>
          <p className="mt-1 text-xs text-muted-foreground">{f.ai_reason} · sender {f.sender_id.slice(0, 8)} · IP {fp["ip"] ?? "—"} · {fp["country"] ?? "—"}</p>
          <div className="mt-3 flex gap-2"><Button size="sm" variant="destructive" disabled={decide.isPending} onClick={() => { if (confirm("Permanently ban this account and queue an authority report?")) decide.mutate({ id: f.id, decision: "banned" }); }}>Ban & report</Button><Button size="sm" variant="outline" disabled={decide.isPending} onClick={() => decide.mutate({ id: f.id, decision: "dismissed" })}>Dismiss</Button></div>
        </li>;
      })}</ul>}
    <h3 className="mt-8 text-sm font-semibold">Authority reports ({q.data?.reports.length ?? 0})</h3>
    <ul className="mt-2 text-xs text-muted-foreground">{(q.data?.reports ?? []).map((r) => <li key={r.id} className="py-1">{new Date(r.created_at).toLocaleString()} · account {r.user_id.slice(0, 8)} · {r.status}</li>)}</ul>
  </div>;
}
