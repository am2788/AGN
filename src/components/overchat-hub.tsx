import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgnCrest } from "@/components/agn-brand";
import { ArenaMediaDeck } from "@/components/arena-media-deck";
import { useAccountSession } from "@/components/account-session";
import { supabase } from "@/integrations/supabase/client";
import { VOTE_CLOSES, VOTE_SEASON, VOTE_TITLES, seasonWeek, voteWindowOpen, type VoteTitleId } from "@/lib/season-vote";

export function OverchatHub() {
  const { user, ready } = useAccountSession();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = window.setInterval(() => setNow(Date.now()), 30000); return () => window.clearInterval(t); }, []);

  return (
    <div className="dark overchat-hub">
      <header className="overchat-header"><AgnCrest /><div><p className="hub-eyebrow">AGN COMMAND DASHBOARD</p><h1>LIVE OVERCHAT</h1><p>Cross-platform community chat & tournament voting</p></div></header>
      {!ready ? <p className="shell-note">Loading…</p> : !user ? (
        <section className="overchat-gate"><h2>Sign up to chat and vote</h2><p>Overchat and title voting are for signed-in spectators and competitors.</p>
          <div className="flex gap-3 flex-wrap justify-center"><Button asChild><Link to="/join">JOIN AGN</Link></Button><Button asChild variant="outline"><Link to="/auth" search={{ mode: "signin" }}>SIGN IN</Link></Button></div></section>
      ) : (
        <div className="overchat-grid">
          <ChatFeed userId={user.id} defaultName={(user.user_metadata?.["display_name"] as string | undefined) ?? user.email?.split("@")[0] ?? "Member"} />
          <div className="overchat-side">
            <TitleVoting userId={user.id} now={now} />
            <ArenaMediaDeck />
          </div>
        </div>
      )}
    </div>
  );
}

function ChatFeed({ userId, defaultName }: { userId: string; defaultName: string }) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const messages = useQuery({
    queryKey: ["overchat"],
    queryFn: async () => {
      const { data, error } = await supabase.from("overchat_messages").select("id, display_name, body, created_at, user_id").order("created_at", { ascending: false }).limit(60);
      if (error) throw error;
      return data.reverse();
    },
    refetchInterval: 4000,
  });
  const post = useMutation({
    mutationFn: async (text: string) => {
      const { error } = await supabase.from("overchat_messages").insert({ body: text, display_name: defaultName.slice(0, 32), user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => { setBody(""); void qc.invalidateQueries({ queryKey: ["overchat"] }); },
  });
  function submit(e: FormEvent) { e.preventDefault(); const t = body.trim(); if (t) post.mutate(t.slice(0, 280)); }
  return (
    <section className="overchat-feed" aria-label="Live chat feed">
      <div className="shell-panel-title"><h2>LIVE CHAT FEED</h2><span>{messages.data?.length ?? 0} RECENT</span></div>
      <ol className="overchat-messages" aria-live="polite">
        {messages.data?.length ? messages.data.map((m) => <li key={m.id} className={m.user_id === userId ? "is-mine" : ""}><strong>{m.display_name}</strong><span>{m.body}</span><time>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></li>)
          : <li className="shell-note">No messages yet — start the conversation.</li>}
      </ol>
      <form onSubmit={submit} className="overchat-form">
        <Input value={body} maxLength={280} onChange={(e) => setBody(e.target.value)} placeholder="Say something to the arena…" aria-label="Chat message" />
        <Button type="submit" size="icon" aria-label="Send message" disabled={post.isPending || !body.trim()}><Send /></Button>
      </form>
      {post.error && <p role="alert" className="shell-note">Message not sent. Try again.</p>}
    </section>
  );
}

function TitleVoting({ userId, now }: { userId: string; now: number | null }) {
  const qc = useQueryClient();
  const open = now === null ? true : voteWindowOpen(now);
  const mine = useQuery({ queryKey: ["title-vote", userId], queryFn: async () => {
    const { data, error } = await supabase.from("title_votes").select("title").eq("season", VOTE_SEASON).maybeSingle();
    if (error) throw error; return data?.title ?? null;
  } });
  const totals = useQuery({ queryKey: ["title-totals"], queryFn: async () => {
    const { data, error } = await supabase.rpc("title_vote_totals", { _season: VOTE_SEASON });
    if (error) throw error; return Object.fromEntries(data.map((r) => [r.title, Number(r.votes)])) as Record<string, number>;
  }, refetchInterval: 15000 });
  const vote = useMutation({
    mutationFn: async (title: VoteTitleId) => { const { error } = await supabase.from("title_votes").insert({ season: VOTE_SEASON, title, user_id: userId }); if (error) throw error; },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["title-vote", userId] }); void qc.invalidateQueries({ queryKey: ["title-totals"] }); },
  });
  const total = Object.values(totals.data ?? {}).reduce((a, b) => a + b, 0);
  const week = now === null ? 0 : seasonWeek(now);
  return (
    <section className="overchat-vote" aria-label="Vote for the next tournaments">
      <div className="shell-panel-title"><h2>VOTE FOR THE NEXT BATCH</h2><span>{open ? "OPEN" : "CLOSED"}</span></div>
      <p className="shell-note">Voting closes {new Date(VOTE_CLOSES).toUTCString().slice(0, 16)} (end of tournament week 4){week ? ` · now week ${week}` : ""}. One vote per account.</p>
      <ul className="overchat-options">
        {VOTE_TITLES.map((t) => { const n = totals.data?.[t.id] ?? 0; const pct = total ? Math.round((n / total) * 100) : 0; return (
          <li key={t.id}><Button variant={mine.data === t.id ? "default" : "outline"} disabled={!open || Boolean(mine.data) || vote.isPending} onClick={() => vote.mutate(t.id)} aria-pressed={mine.data === t.id}>
            <Vote aria-hidden="true" /><span className="flex-1 text-left">{t.label}</span><span>{pct}%</span></Button>
            <div className="overchat-bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div></li>
        ); })}
      </ul>
      {mine.data && <p className="shell-note">Your vote is in. Thanks!</p>}
      {vote.error && <p role="alert" className="shell-note">Vote not recorded — voting may be closed.</p>}
    </section>
  );
}
