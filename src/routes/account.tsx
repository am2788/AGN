import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ParticipantAvatar } from "@/components/participant-avatar";
import { getParticipantAccount, updateParticipantProfile } from "@/lib/participant.functions";
import { AvatarForge } from "@/components/avatar-forge";
import { CallingCard } from "@/components/calling-card";
import { LeaderboardPanel } from "@/components/leaderboard-panel";
import { profileSchema, RANK_STYLES, RANKS, rankForPoints, cosmeticUnlocks, ACCENT_STYLES, FONT_STYLES } from "@/lib/participant";
import { ARENA_TITLES, formatUsd } from "@/lib/arena";
import { useAccountSession } from "@/components/account-session";

export const Route = createFileRoute("/account")({ head: () => ({ meta: [
  { title: "Your Player Account — AGN" }, { name: "description", content: "Your AGN participant profile, rewards, and saved tournament entries." },
  { property: "og:title", content: "Your Player Account — AGN" }, { property: "og:description", content: "Manage your AGN profile and return to your tournament registrations." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: AccountPage });
function AccountPage() {
  const { user, ready } = useAccountSession();
  const getAccount = useServerFn(getParticipantAccount);
  const saveProfile = useServerFn(updateParticipantProfile);
  const account = useQuery({ queryKey: ["participant-account", user?.id], queryFn: () => getAccount(), enabled: Boolean(user) });
  const [values, setValues] = useState({ display_name: "", participant_type: "viewer" as "viewer" | "player", leaderboard_visible: false, avatar_key: "crest" as "crest" | "shield" | "swords", accent_key: "crimson" as "crimson" | "gold" | "cyan" | "silver", font_key: "body" as "body" | "mono" | "display" | "scifi" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (account.data) setValues(profileSchema.parse(account.data.profile)); }, [account.data]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage("");
    try { await saveProfile({ data: profileSchema.parse(values) }); await account.refetch(); setMessage("Profile saved."); }
    catch (err) { setMessage(err instanceof Error ? err.message : "Could not save profile."); }
    finally { setSaving(false); }
  }
  return <main className="dark min-h-screen bg-vault-bg px-4 py-10 font-body text-foreground"><div className="mx-auto max-w-5xl">
    <h1 className="font-display text-3xl font-bold text-gold">Your AGN account</h1>
    <div className="mt-4 flex flex-wrap gap-4 text-sm"><Link to="/" className="text-gold underline">Arena</Link><Link to="/leaderboard" className="text-gold underline">Leaderboard</Link><Link to="/shop" className="text-gold underline">Event merchandise</Link><Link to="/admin" className="text-gold underline">Admin monitor</Link></div>
    {!ready ? <p className="mt-8">Loading account…</p> : !user ? <div className="mt-8"><p>Sign in to view your profile and saved tournament entries.</p><Button asChild className="mt-4"><Link to="/auth">Sign in</Link></Button></div> : account.isPending ? <p className="mt-8">Loading your entries…</p> : account.error ? <div className="mt-8"><p role="alert">{account.error.message}</p><Button onClick={() => void account.refetch()}>Retry</Button></div> : account.data && <>
      <section className={`mt-8 border-y border-wager-line/40 py-6 ${account.data.rewards.points >= 5000 ? "rank-platinum px-4" : ""}`}>
        <div className="flex items-center gap-4"><ParticipantAvatar avatar={values.avatar_key} url={account.data.avatarUrl} points={account.data.rewards.points} /><div><h2 className={`break-words text-xl ${FONT_STYLES[values.font_key]} ${ACCENT_STYLES[values.accent_key]} ${account.data.rewards.points >= 2000 ? "text-glow-gold" : ""}`}>{account.data.profile.display_name}</h2><p className="mt-1 text-xs text-muted-foreground">{account.data.rewards.rank_name} · {account.data.rewards.points} engagement points</p></div></div>
        <div className="mt-5 max-w-2xl"><CallingCard name={account.data.profile.display_name} points={account.data.rewards.points} fontKey={values.font_key} stat={`${account.data.rewards.points.toLocaleString()} pts`} /></div>
        <div className="mt-5 max-w-xl"><div className="flex justify-between text-xs text-muted-foreground"><span>{rankForPoints(account.data.rewards.points).name}</span><span>{RANKS.find((r) => r.min > account.data.rewards.points)?.name ?? "Master"}</span></div><progress aria-label="Rank progress" value={account.data.rewards.points} max={RANKS.find((r) => r.min > account.data.rewards.points)?.min ?? 10000} className="mt-2 h-2 w-full accent-crimson" /></div>
        <form onSubmit={submit} className="mt-6 grid max-w-xl gap-4">
          <label className="text-xs text-gold">Player / viewer name<input aria-label="Player or viewer name" value={values.display_name} onChange={(e) => setValues({ ...values, display_name: e.target.value })} required maxLength={32} className="mt-2 block h-10 w-full rounded-sm border border-input bg-vault-panel px-3 text-sm text-foreground" /></label>
          <label className="text-xs text-gold">Participation<select aria-label="Participation" value={values.participant_type} onChange={(e) => setValues({ ...values, participant_type: e.target.value === "player" ? "player" : "viewer" })} className="mt-2 block h-10 w-full border border-input bg-vault-panel px-3 text-sm text-foreground"><option value="viewer">Viewer</option><option value="player">Player</option></select></label>
          <fieldset><legend className="mb-2 text-xs text-gold">Avatar</legend><div className="flex gap-3">{(["crest", "shield", "swords"] as const).map((avatar) => <label key={avatar} className="cursor-pointer text-center text-xs"><input type="radio" name="avatar" checked={values.avatar_key === avatar} onChange={() => setValues({ ...values, avatar_key: avatar })} className="accent-crimson" /><ParticipantAvatar avatar={avatar} />{avatar}</label>)}</div></fieldset>
          <fieldset disabled={!cosmeticUnlocks(account.data.rewards.points).accents}><legend className="mb-2 text-xs text-gold">Accent color · Contender</legend><div className="flex gap-4">{(["crimson", "gold", "cyan", "silver"] as const).map((accent) => <label key={accent} className={`text-xs ${ACCENT_STYLES[accent]}`}><input type="radio" name="accent" checked={values.accent_key === accent} onChange={() => setValues({ ...values, accent_key: accent })} className="mr-1 accent-crimson" />{accent}</label>)}</div></fieldset>
          <label className="text-xs text-gold">Typography · Veteran<select aria-label="Profile typography" disabled={!cosmeticUnlocks(account.data.rewards.points).typography} value={values.font_key} onChange={(e) => setValues({ ...values, font_key: profileSchema.shape.font_key.parse(e.target.value) })} className="mt-2 block h-10 w-full border border-input bg-vault-panel px-3 text-sm text-foreground"><option value="body">Space Grotesk</option><option value="scifi">Orbitron</option><option value="mono">Monospace</option><option value="display">Cinzel</option></select></label>
          <label className="flex items-start gap-3 text-xs text-muted-foreground"><input type="checkbox" checked={values.leaderboard_visible} onChange={(e) => setValues({ ...values, leaderboard_visible: e.target.checked })} className="accent-crimson" />Show my name and avatar on the participant leaderboard. My tournament entries stay private.</label>
          <Button type="submit" disabled={saving} className="bg-crimson text-foreground hover:bg-crimson/80">{saving ? "Saving…" : "Save profile"}</Button>
          {message && <p role="status" className="text-sm text-gold">{message}</p>}
        </form>
      </section>
      <section className="py-8"><h2 className="font-display text-xl text-gold">Your tournament entries</h2>
        {account.data.entries.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No entries yet.</p> : <ul className="mt-4 divide-y divide-wager-line/30">{account.data.entries.map((entry) => <li key={entry.id} className="flex flex-wrap justify-between gap-4 py-4"><div><h3 className="text-sm font-bold">{ARENA_TITLES[entry.lane - 1]}</h3><p className="mt-1 text-xs text-muted-foreground">{entry.callsign} · {entry.pricing_option === "franchise" ? "Season Franchise Pass" : "Weekly / Split Tier"}</p></div><div className="text-right text-sm text-gold">{formatUsd(entry.quoted_fee_cents)}<p className="mt-1 text-xs text-muted-foreground">Payment not started · entry not confirmed</p></div></li>)}</ul>}
      </section>
      <AvatarForge points={account.data.rewards.points} onSaved={() => void account.refetch()} />
      <LeaderboardPanel />
    </>}
  </div></main>;
}