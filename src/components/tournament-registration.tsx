import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAccountSession } from "./account-session";
import { ARENA_LANES, ARENA_TITLES, formatUsd } from "@/lib/arena";
import { tournamentQuote, tournamentRegistrationSchema, TOURNAMENT_AGE_NOTE, type PricingOption } from "@/lib/tournament-entry";
import { registerTournament } from "@/lib/tournament-entry.functions";

export function TournamentRegistration() {
  const register = useServerFn(registerTournament);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { user } = useAccountSession();
  const signedIn = Boolean(user);
  const [lane, setLane] = useState(2);
  const [option, setOption] = useState<PricingOption>("franchise");
  const [callsign, setCallsign] = useState("");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Awaited<ReturnType<typeof registerTournament>> | null>(null);
  useEffect(() => { setSaved(null); }, [user?.id]);
  const quote = tournamentQuote(lane, option);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = tournamentRegistrationSchema.safeParse({ callsign, lane, pricingOption: option, termsAccepted: terms });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your details."); return; }
    setBusy(true); setError("");
    try {
      setSaved(await register({ data: parsed.data }));
      await queryClient.invalidateQueries({ queryKey: ["participant-account", user?.id] });
    }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save your registration."); }
    finally { setBusy(false); }
  }
  return <section aria-label="Tournament registration" className="w-full border-y border-wager-line/40 py-8">
    <div className="mx-auto max-w-xl text-center">
      <h2 className="font-display text-xl font-bold text-gold">Claim your arena seat</h2>
      <p className="mt-3 text-sm text-muted-foreground">{TOURNAMENT_AGE_NOTE}</p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button className="mt-5 bg-crimson text-foreground hover:bg-crimson/80"><Trophy /> Tournament registration</Button></DialogTrigger>
        <DialogContent className="dark max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto border-wager-line bg-vault-panel font-body text-foreground">
          <DialogHeader><DialogTitle className="pr-6 font-display text-gold">Tournament registration</DialogTitle><DialogDescription>All ages · No payment taken · Entry is not confirmed until payment and tournament availability are enabled.</DialogDescription></DialogHeader>
          {saved ? <div role="status" className="space-y-3 py-4">
            <CheckCircle2 className="size-8 text-gold" />
            <h3 className="font-display text-lg text-gold">{saved.alreadyRegistered ? "Existing registration" : "Registration saved"}</h3>
            <p>{saved.registration.callsign} · {ARENA_TITLES[saved.registration.lane - 1]}</p>
            <p className="text-sm">{saved.registration.pricing_option === "franchise" ? "Season Franchise Pass" : "Flexible Weekly / Split Tier"} · {formatUsd(saved.registration.quoted_fee_cents)}</p>
            <p className="text-xs text-muted-foreground">Payment not started. No seat, paid access, or wager permission has been issued.</p>
            <Button asChild><Link to="/account">View my entries</Link></Button>
            <Button variant="outline" onClick={() => setSaved(null)}>Register another lane</Button>
          </div> : <form onSubmit={submit} className="space-y-4">
            <label className="block text-xs text-gold" htmlFor="entry-lane">Tournament lane</label>
            <select id="entry-lane" value={lane} onChange={(e) => setLane(Number(e.target.value))} disabled={busy} className="h-10 w-full rounded-sm border border-input bg-vault-bg px-3 text-sm">
              {ARENA_LANES.map((value, i) => <option key={value} value={value}>{ARENA_TITLES[i]}</option>)}
            </select>
            <fieldset><legend className="mb-2 text-xs text-gold">Payment option · {quote.format === "solo" ? "Solos" : "Teams"}</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["franchise", "weekly"] as const).map((value) => <label key={value} className={`min-w-0 cursor-pointer rounded-sm border p-3 text-xs has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-crimson ${option === value ? "border-crimson bg-crimson/10" : "border-input"}`}>
                  <input className="sr-only" type="radio" name="pricing" checked={option === value} onChange={() => setOption(value)} disabled={busy} />
                  <span className="block font-bold text-gold">{value === "franchise" ? "Season Franchise Pass" : "Flexible Weekly / Split Tier"}</span>
                  <span className="mt-2 block font-mono text-base">{formatUsd(tournamentQuote(lane, value).feeCents)}</span>
                  <span className="mt-1 block text-muted-foreground">{value === "franchise" ? "Upfront · unlimited split access" : "Per week"}</span>
                </label>)}
              </div>
            </fieldset>
            <dl className="space-y-2 border-y border-wager-line/30 py-3 text-xs">
              <div className="flex justify-between gap-3"><dt>Base {option === "weekly" ? "weekly" : "upfront"} price</dt><dd className="font-mono text-gold">{formatUsd(quote.feeCents)}</dd></div>
              <div className="flex justify-between gap-3"><dt>Finals vault contribution</dt><dd className="text-muted-foreground">Awaiting confirmed allocation</dd></div>
              {option === "weekly" && <div className="flex justify-between gap-3"><dt>Monthly liquidity adjustment</dt><dd className="text-muted-foreground">Not yet specified</dd></div>}
            </dl>
            <label className="block text-xs text-gold" htmlFor="entry-callsign">Callsign</label>
            <input id="entry-callsign" value={callsign} onChange={(e) => setCallsign(e.target.value)} maxLength={24} disabled={busy} className="h-10 w-full rounded-sm border border-input bg-vault-bg px-3 text-sm" autoComplete="username" />
            <label className="flex items-start gap-3 text-xs text-muted-foreground"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} disabled={busy} className="mt-0.5 accent-crimson" />I accept the AGN tournament terms. This saves my registration interest only and does not authorize a charge.</label>
            {error && <p role="alert" className="text-xs text-amber-alert">{error}</p>}
            {signedIn ? <Button type="submit" disabled={busy} className="w-full bg-crimson text-foreground hover:bg-crimson/80">{busy ? "Saving…" : "Save registration"}</Button> : <Button asChild className="w-full"><Link to="/auth">Sign in to save registration</Link></Button>}
          </form>}
        </DialogContent>
      </Dialog>
    </div>
  </section>;
}