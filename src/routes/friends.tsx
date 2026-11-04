import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, MessageSquare, Search, ShieldCheck, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { useAccountSession } from "@/components/account-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { answerFriendRequest, listConnections, listMessages, searchMembers, sendDirectMessage, getOfficialAccount, sendFriendRequest } from "@/lib/social.functions";

export const Route = createFileRoute("/friends")({
  head: () => ({ meta: [
    { title: "Friends & Messages — AGN" },
    { name: "description", content: "Add friends and send private messages on Aether Gaming Networks, protected by safety screening." },
    { property: "og:title", content: "Friends & Messages — AGN" },
    { property: "og:description", content: "Connect with other AGN members and message your friends." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: FriendsPage,
});

function FriendsPage() {
  const { user, ready } = useAccountSession();
  if (!ready) return <Shell><p role="status" className="text-muted-foreground">Loading…</p></Shell>;
  if (!user) return <Shell><p className="text-muted-foreground">Sign in to add friends and send messages.</p><Button asChild className="mt-4"><Link to="/auth">Sign in</Link></Button></Shell>;
  return <Shell><FriendsBody /></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="dark min-h-screen bg-vault-bg px-4 py-8 font-body text-foreground sm:px-8"><div className="mx-auto max-w-5xl">
    <header className="border-b border-wager-line/40 pb-5"><p className="flex items-center gap-2 text-xs text-crimson"><ShieldCheck className="size-4" /> SAFETY-SCREENED</p><h1 className="mt-2 font-display text-2xl font-bold text-gold">Friends & messages</h1></header>
    <div className="pt-6">{children}</div></div></main>;
}

function FriendsBody() {
  const qc = useQueryClient();
  const readConnections = useServerFn(listConnections);
  const search = useServerFn(searchMembers);
  const request = useServerFn(sendFriendRequest);
  const answer = useServerFn(answerFriendRequest);
  const connections = useQuery({ queryKey: ["connections"], queryFn: () => readConnections() });
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ id: string; display_name: string }[]>([]);
  const [active, setActive] = useState<{ id: string; name: string } | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["connections"] });

  const doSearch = useMutation({ mutationFn: () => search({ data: { q } }), onSuccess: setResults, onError: (e: Error) => toast.error(e.message) });
  const doRequest = useMutation({ mutationFn: (to: string) => request({ data: { to } }), onSuccess: () => { toast.success("Friend request sent"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const doAnswer = useMutation({ mutationFn: (v: { id: string; accept: boolean }) => answer({ data: v }), onSuccess: refresh, onError: (e: Error) => toast.error(e.message) });

  const rows = connections.data ?? [];
  const incoming = rows.filter((r) => r.status === "pending" && r.incoming);
  const outgoing = rows.filter((r) => r.status === "pending" && !r.incoming);
  const friends = rows.filter((r) => r.status === "accepted");

  return <div className="grid gap-8 md:grid-cols-[280px_1fr]">
    <aside className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim().length >= 2) doSearch.mutate(); }} className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find by name" maxLength={40} aria-label="Find members by name" />
        <Button type="submit" size="icon" aria-label="Search"><Search /></Button>
      </form>
      {results.length > 0 && <ul className="divide-y divide-border text-sm">{results.map((r) => <li key={r.id} className="flex items-center justify-between py-2"><span>{r.display_name}</span><Button size="sm" variant="outline" onClick={() => doRequest.mutate(r.id)}><UserPlus /> Add</Button></li>)}</ul>}
      {incoming.length > 0 && <section><h2 className="text-xs text-muted-foreground">REQUESTS</h2><ul className="mt-2 divide-y divide-border text-sm">{incoming.map((r) => <li key={r.friendship_id} className="flex items-center justify-between py-2"><span>{r.display_name}</span><span className="flex gap-1"><Button size="icon" variant="outline" aria-label={`Accept ${r.display_name}`} onClick={() => doAnswer.mutate({ id: r.friendship_id, accept: true })}><Check /></Button><Button size="icon" variant="ghost" aria-label={`Decline ${r.display_name}`} onClick={() => doAnswer.mutate({ id: r.friendship_id, accept: false })}><X /></Button></span></li>)}</ul></section>}
      <section><h2 className="text-xs text-muted-foreground">FRIENDS ({friends.length})</h2>
        {connections.isPending ? <p className="mt-2 text-sm text-muted-foreground">Loading…</p> : friends.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No friends yet.</p> :
          <ul className="mt-2 space-y-1">{friends.map((r) => <li key={r.friendship_id}><button type="button" onClick={() => setActive({ id: r.other_id, name: r.display_name })} className={`flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-vault-panel ${active?.id === r.other_id ? "bg-vault-panel text-gold" : ""}`}><MessageSquare className="size-4" />{r.display_name}</button></li>)}</ul>}
      </section>
      {outgoing.length > 0 && <p className="text-xs text-muted-foreground">Pending: {outgoing.map((r) => r.display_name).join(", ")}</p>}
    </aside>
    <section className="min-h-[360px] border border-border bg-vault-panel/40 p-4">{active ? <Conversation key={active.id} other={active} /> : <p className="text-sm text-muted-foreground">Pick a friend to start a conversation.</p>}</section>
  </div>;
}

function Conversation({ other }: { other: { id: string; name: string } }) {
  const { user } = useAccountSession();
  const read = useServerFn(listMessages);
  const send = useServerFn(sendDirectMessage);
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const getOfficial = useServerFn(getOfficialAccount);
  const official = useQuery({ queryKey: ["official-account"], queryFn: () => getOfficial(), staleTime: Infinity });
  const msgs = useQuery({ queryKey: ["dm", other.id], queryFn: () => read({ data: { with: other.id } }), refetchInterval: 5000 });
  const doSend = useMutation({
    mutationFn: () => send({ data: { to: other.id, body } }),
    onSuccess: (r) => { setBody(""); if (!r.delivered) toast.message("This message couldn't be delivered."); qc.invalidateQueries({ queryKey: ["dm", other.id] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return <div className="flex h-full flex-col">
    <h2 className="border-b border-border pb-2 font-semibold text-gold">{other.name}</h2>
    <ol className="flex-1 space-y-2 overflow-y-auto py-3 text-sm" aria-live="polite">
      {(msgs.data ?? []).map((m) => <li key={m.id} className={m.sender_id === user?.id ? "text-right" : ""}><span className={`inline-block max-w-[80%] rounded-sm px-3 py-2 ${m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{m.body}</span></li>)}
    </ol>
    {official.data?.id === other.id ? <p className="border-t border-border pt-3 text-xs text-muted-foreground">Automated AGN message — replies are turned off.</p> :
    <form onSubmit={(e) => { e.preventDefault(); if (body.trim()) doSend.mutate(); }} className="flex gap-2 border-t border-border pt-3">
      <Input value={body} onChange={(e) => setBody(e.target.value)} maxLength={1000} placeholder={`Message ${other.name}`} aria-label="Message" />
      <Button type="submit" disabled={doSend.isPending}>Send</Button>
    </form>}
  </div>;
}
