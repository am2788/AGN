import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAccountSession } from "./account-session";
import { getParticipantLeaderboard } from "@/lib/participant.functions";
import { ParticipantAvatar } from "./participant-avatar";
import { CallingCard } from "./calling-card";
export function LeaderboardPanel() {
  const { user } = useAccountSession(); const get = useServerFn(getParticipantLeaderboard);
  const [tab, setTab] = useState("viewers");
  const board = useQuery({ queryKey: ["leaderboard", user?.id], queryFn: () => get(), enabled: Boolean(user) });
  const players = board.data?.filter((p) => p.participant_type === "player").sort((a,b) => b.bracketStage-a.bracketStage || b.bracketWins-a.bracketWins || a.display_name.localeCompare(b.display_name)) ?? [];
  const viewers = board.data?.filter((p) => p.participant_type === "viewer") ?? [];
  return <><section className="border-t border-wager-line/30 py-8"><h2 className="font-display text-xl text-gold">Global leaderboards</h2><Tabs value={tab} onValueChange={setTab} className="mt-4"><TabsList className="grid h-12 w-full max-w-md grid-cols-2"><TabsTrigger value="players">Players · Brackets</TabsTrigger><TabsTrigger value="viewers">Viewers · Engagement</TabsTrigger></TabsList>{(["players", "viewers"] as const).map((type) => <TabsContent key={type} value={type}>{board.isPending ? <p className="py-6">Loading participants…</p> : board.error ? <p role="alert" className="py-6">{board.error.message}</p> : <><p className="my-4 text-xs text-muted-foreground">{type === "players" ? "Verified bracket stage · Match wins" : "Engagement points · Verified actions"}</p>{!(type === "players" ? players : viewers).length ? <p className="py-4 text-sm text-muted-foreground">No participants have opted into this board yet.</p> : <ul className="divide-y divide-wager-line/30">{(type === "players" ? players : viewers).map((row) => <li key={row.id} className="flex items-center gap-4 py-5"><ParticipantAvatar avatar={row.avatar_key} points={row.points} /><div className="min-w-0 flex-1"><CallingCard name={row.display_name} points={row.points} fontKey={row.font_key} stat={type === "players" ? `Stage ${row.bracketStage} · ${row.bracketWins} wins` : `${row.points.toLocaleString()} pts`} /><p className="mt-2 text-xs capitalize text-muted-foreground">{row.rank}</p></div></li>)}</ul>}</>}</TabsContent>)}</Tabs></section></>;
}