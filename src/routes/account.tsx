import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ParticipantAvatar } from "@/components/participant-avatar";
import { getParticipantAccount, updateParticipantProfile, equipCallingCard } from "@/lib/participant.functions";
import { AvatarForge } from "@/components/avatar-forge";
import { CallingCard } from "@/components/calling-card";
import { LeaderboardPanel } from "@/components/leaderboard-panel";
import { profileSchema, RANK_STYLES, RANKS, rankForPoints, cosmeticUnlocks, ACCENT_STYLES, FONT_STYLES } from "@/lib/participant";
import { ARENA_TITLES, formatUsd } from "@/lib/arena";
import { useAccountSession } from "@/components/account-session";
import { EntryCheckout } from "@/components/entry-checkout";
import { HardlockConfirmed } from "@/components/hardlock-confirmed";
import { PAYMENT_STATUS_LABEL, seatConfirmed } from "@/lib/tournament-payments";
import { THEME_KEYS, THEME_LABELS, applyTheme, type ThemeKey } from "@/lib/theme";
import { CALLING_CARD_ARTWORK, CARD_TIER_LABELS, getArtworkByKey } from "@/lib/calling-card-artwork";

export const Route = createFileRoute("/account")({ head: () => ({ meta: [
  { title: "Your Player Account — AGN" }, { name: "description", content: "Your AGN participant profile, rewards, and saved tournament entries." },
  { property: "og:title", content: "Your Player Account — AGN" }, { property: "og:description", content: "Manage your AGN profile and return to your tournament registrations." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }),
  validateSearch: (search: Record<string, unknown>): { checkout?: string; entry?: string } => ({
    ...(typeof search["checkout"] === "string" ? { checkout: search["checkout"] } : {}),
    ...(typeof search["entry"] === "string" ? { entry: search["entry"] } : {}),
  }),
  component: AccountPage });
function AccountPage() {
  const { user, ready } = useAccountSession();
  const getAccount = useServerFn(getParticipantAccount);
  const saveProfile = useServerFn(updateParticipantProfile);
  const account = useQuery({ queryKey: ["participant-account", user?.id], queryFn: () => getAccount(), enabled: Boolean(user) });
  const [values, setValues] = useState({ display_name: "", participant_type: "viewer" as "viewer" | "player", leaderboard_visible: false, avatar_key: "crest" as "crest" | "shield" | "swords", accent_key: "crimson" as "crimson" | "gold" | "cyan" | "silver", font_key: "body" as "body" | "mono" | "display" | "scifi", theme_key: "simple-gold" as ThemeKey });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [equipping, setEquipping] = useState<string | null>(null);
  const [equipMessage, setEquipMessage] = useState("");
  const equipCard = useServerFn(equipCallingCard);
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const returning = search.checkout === "complete" ? search.entry : undefined;
  const returnedEntry = returning ? account.data?.entries.find((e) => e.id === returning) : undefined;
  // The payment confirmation arrives a moment after checkout; poll briefly until the seat is confirmed.
  useEffect(() => {
    if (!returning || !account.data || (returnedEntry && seatConfirmed(returnedEntry.payment_status))) return;
    const t = setTimeout(() => void account.refetch(), 2500);
    return () => clearTimeout(t);
  }, [returning, account.data, returnedEntry, account]);
  useEffect(() => { if (account.data) setValues(profileSchema.parse(account.data.profile)); }, [account.data]);
  // The saved theme applies as soon as the profile loads; switching it later
  // never reloads the page, so the session, form input and media keep running.
  useEffect(() => { if (account.data) applyTheme(profileSchema.parse(account.data.profile).theme_key); }, [account.data]);
  async function equip(key: string | null) {
    setEquipping(key ?? "default"); setEquipMessage("");
    try { await equipCard({ data: { cardKey: key } }); await account.refetch(); setEquipMessage(key ? "Calling card equipped." : "Rank default artwork restored."); }
    catch (err) { setEquipMessage(err instanceof Error ? err.message : "Could not equip that calling card."); }
    finally { setEquipping(null); }
  }
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
      {returnedEntry && (seatConfirmed(returnedEntry.payment_status)
        ? <HardlockConfirmed title={ARENA_TITLES[returnedEntry.lane - 1] ?? "Tournament entry"} onClose={() => void navigate({ search: {}, replace: true })} />
        : <p role="status" className="mt-8 text-sm text-gold">Confirming your payment…</p>)}
      <section className={`mt-8 border-y border-wager-line/40 py-6 ${account.data.rewards.points >= 5000 ? "rank-platinum px-4" : ""}`}>
        <div className="flex items-center gap-4"><ParticipantAvatar avatar={values.avatar_key} url={account.data.avatarUrl} points={account.data.rewards.points} /><div><h2 className={`break-words text-xl ${FONT_STYLES[values.font_key]} ${ACCENT_STYLES[values.accent_key]} ${account.data.rewards.points >= 2000 ? "text-glow-gold" : ""}`}>{account.data.profile.display_name}</h2><p className="mt-1 text-xs text-muted-foreground">{account.data.rewards.rank_name} · {account.data.rewards.points} engagement points</p></div></div>
        <div className="mt-5 max-w-2xl"><CallingCard name={account.data.profile.display_name} points={account.data.rewards.points} fontKey={values.font_key} stat={`${account.data.rewards.points.toLocaleString()} pts`} artworkUrl={getArtworkByKey(account.data.profile.equipped_card_key)?.url} /></div>
        <div className="mt-5 max-w-xl"><div className="flex justify-between text-xs text-muted-foreground"><span>{rankForPoints(account.data.rewards.points).name}</span><span>{RANKS.find((r) => r.min > account.data.rewards.points)?.name ?? "Master"}</span></div><progress aria-label="Rank progress" value={account.data.rewards.points} max={RANKS.find((r) => r.min > account.data.rewards.points)?.min ?? 10000} className="mt-2 h-2 w-full accent-crimson" /></div>
        <form onSubmit={submit} className="mt-6 grid max-w-xl gap-4">
          <label className="text-xs text-gold">Player / viewer name<input aria-label="Player or viewer name" value={values.display_name} onChange={(e) => setValues({ ...values, display_name: e.target.value })} required maxLength={32} className="mt-2 block h-10 w-full rounded-sm border border-input bg-vault-panel px-3 text-sm text-foreground" /></label>
          <label className="text-xs text-gold">Participation<select aria-label="Participation" value={values.participant_type} onChange={(e) => setValues({ ...values, participant_type: e.target.value === "player" ? "player" : "viewer" })} className="mt-2 block h-10 w-full border border-input bg-vault-panel px-3 text-sm text-foreground"><option value="viewer">Viewer</option><option value="player">Player</option></select></label>
          <fieldset><legend className="mb-2 text-xs text-gold">Avatar</legend><div className="flex gap-3">{(["crest", "shield", "swords"] as const).map((avatar) => <label key={avatar} className="cursor-pointer text-center text-xs"><input type="radio" name="avatar" checked={values.avatar_key === avatar} onChange={() => setValues({ ...values, avatar_key: avatar })} className="accent-crimson" /><ParticipantAvatar avatar={avatar} />{avatar}</label>)}</div></fieldset>
          <fieldset disabled={!cosmeticUnlocks(account.data.rewards.points).accents}><legend className="mb-2 text-xs text-gold">Accent color · Contender</legend><div className="flex gap-4">{(["crimson", "gold", "cyan", "silver"] as const).map((accent) => <label key={accent} className={`text-xs ${ACCENT_STYLES[accent]}`}><input type="radio" name="accent" checked={values.accent_key === accent} onChange={() => setValues({ ...values, accent_key: accent })} className="mr-1 accent-crimson" />{accent}</label>)}</div></fieldset>
          <label className="text-xs text-gold">Typography · Veteran<select aria-label="Profile typography" disabled={!cosmeticUnlocks(account.data.rewards.points).typography} value={values.font_key} onChange={(e) => setValues({ ...values, font_key: profileSchema.shape.font_key.parse(e.target.value) })} className="mt-2 block h-10 w-full border border-input bg-vault-panel px-3 text-sm text-foreground"><option value="body">Space Grotesk</option><option value="scifi">Orbitron</option><option value="mono">Monospace</option><option value="display">Cinzel</option></select></label>
          <fieldset><legend className="mb-2 text-xs text-gold">Site theme</legend><div className="flex flex-wrap gap-4">{THEME_KEYS.map((theme) => <label key={theme} className="text-xs text-foreground"><input type="radio" name="theme" checked={values.theme_key === theme} onChange={() => { setValues({ ...values, theme_key: theme }); applyTheme(theme); }} className="mr-1 accent-crimson" />{THEME_LABELS[theme]}</label>)}</div><p className="mt-2 text-xs text-muted-foreground">Themes change only how the site looks. Your page, sign-in and anything playing stay exactly as they are.</p></fieldset>
          <label className="flex items-start gap-3 text-xs text-muted-foreground"><input type="checkbox" checked={values.leaderboard_visible} onChange={(e) => setValues({ ...values, leaderboard_visible: e.target.checked })} className="accent-crimson" />Show my name and avatar on the participant leaderboard. My tournament entries stay private.</label>
          <Button type="submit" disabled={saving} className="bg-crimson text-foreground hover:bg-crimson/80">{saving ? "Saving…" : "Save profile"}</Button>
          {message && <p role="status" className="text-sm text-gold">{message}</p>}
        </form>
      </section>
      <section className="border-b border-wager-line/40 py-8"><h2 className="font-display text-xl text-gold">Calling-card collection</h2>
        <p className="mt-2 text-xs text-muted-foreground">Equip one card — it shows on your profile, the leaderboard and OverChat. Standard cards are open to everyone; premium cards unlock through verified ownership.</p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <li><button type="button" onClick={() => void equip(null)} disabled={equipping !== null} className={`w-full border px-3 py-3 text-left text-xs ${account.data.profile.equipped_card_key === null ? "border-gold text-gold" : "border-wager-line/40 text-muted-foreground"}`} aria-pressed={account.data.profile.equipped_card_key === null}>Rank default{account.data.profile.equipped_card_key === null ? " · equipped" : ""}</button></li>
          {CALLING_CARD_ARTWORK.map((card) => { const equipped = account.data.profile.equipped_card_key === card.key; return (
            <li key={card.key}><button type="button" onClick={() => void equip(card.key)} disabled={equipping !== null} className={`w-full border p-1 text-left ${equipped ? "border-gold" : "border-wager-line/40"}`} aria-pressed={equipped}>
              <img src={card.url} alt="" loading="lazy" className="aspect-[21/9] w-full object-cover" />
              <span className="mt-1 block px-1 pb-1 text-xs text-foreground">{card.name}</span>
              <span className="block px-1 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">{CARD_TIER_LABELS[card.tier]}{equipped ? " · equipped" : ""}</span>
            </button></li>); })}
        </ul>
        {equipMessage && <p role="status" className="mt-3 text-sm text-gold">{equipMessage}</p>}
      </section>
      <section className="py-8"><h2 className="font-display text-xl text-gold">Your tournament entries</h2>
        {account.data.entries.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No entries yet.</p> : <ul className="mt-4 divide-y divide-wager-line/30">{account.data.entries.map((entry) => <li key={entry.id} className="flex flex-wrap justify-between gap-4 py-4"><div><h3 className="text-sm font-bold">{ARENA_TITLES[entry.lane - 1]}</h3><p className="mt-1 text-xs text-muted-foreground">{entry.callsign} · {entry.pricing_option === "franchise" ? "Season Franchise Pass" : "Weekly / Split Tier"}</p></div><div className="text-right text-sm text-gold">{formatUsd(entry.quoted_fee_cents)}<p className="mt-1 text-xs text-muted-foreground">{PAYMENT_STATUS_LABEL[entry.payment_status] ?? entry.payment_status}</p></div><div className="w-full sm:max-w-sm"><EntryCheckout registrationId={entry.id} pricingOption={entry.pricing_option} paymentStatus={entry.payment_status} /></div></li>)}</ul>}
      </section>
      <AvatarForge points={account.data.rewards.points} onSaved={() => void account.refetch()} />
      <LeaderboardPanel />
    </>}
  </div></main>;
}