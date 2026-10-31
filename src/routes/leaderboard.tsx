import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAccountSession } from "@/components/account-session";
import { ParticipantAvatar } from "@/components/participant-avatar";
import { getParticipantLeaderboard } from "@/lib/participant.functions";
import { RANK_STYLES } from "@/lib/participant";
import { Button } from "@/components/ui/button";
import { LeaderboardPanel } from "@/components/leaderboard-panel";
import { CallingCardShowcase } from "@/components/calling-card-showcase";
export const Route = createFileRoute("/leaderboard")({ head: () => ({ meta: [
  { title: "Participant Leaderboard — AGN" }, { name: "description", content: "AGN player and viewer engagement ranks and participant rewards." },
  { property: "og:title", content: "Participant Leaderboard — AGN" }, { property: "og:description", content: "Recognizing AGN players and viewers through participant ranks." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: Leaderboard });
function Leaderboard() {
  const { user, ready } = useAccountSession(); const get = useServerFn(getParticipantLeaderboard);
  const board = useQuery({ queryKey: ["leaderboard", user?.id], queryFn: () => get(), enabled: Boolean(user) });
  return <main className="dark min-h-screen bg-vault-bg px-4 py-10 font-body text-foreground"><div className="mx-auto max-w-4xl"><h1 className="font-display text-3xl text-gold">Participant leaderboard</h1>
    <Link to="/account" className="mt-4 inline-block text-sm text-gold underline">Your profile &amp; entries</Link>
    <CallingCardShowcase />{!ready ? <p className="mt-8">Loading…</p> : !user ? <Button asChild className="mt-8 block w-fit"><Link to="/auth">Sign in to view participants</Link></Button> : <LeaderboardPanel />}
  </div></main>;
}