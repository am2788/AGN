import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronRight, ChevronsRight, Crown, Gem, LockKeyhole, Shield, Swords, Trophy, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AgnCrest } from "@/components/agn-brand";
import { TournamentRegistration } from "@/components/tournament-registration";
import { GatewaySecurity } from "@/components/gateway-security";
import { CheckoutPreview } from "@/components/checkout-preview";
import { HardlockPreview } from "@/components/hardlock";
import { GATEWAY_TIERS, gatewaySelection, type GatewayTierId } from "@/lib/gateway";
import selectionPlate from "@/assets/gateway/selection.png.asset.json";
import securityPlate from "@/assets/gateway/security.png.asset.json";
import registrationPlate from "@/assets/gateway/registration.png.asset.json";
import tunnelVideo from "@/assets/gateway/tunnel.mp4.asset.json";
import checkoutPlate from "@/assets/gateway/checkout.png.asset.json";
import hardlockPlate from "@/assets/gateway/hardlock-plate.png.asset.json";

const PRIZES = [
  { title: "Daily Match Winnings", subtitle: "Daily competitive match prizes", Icon: Trophy },
  { title: "Finals Qualifier Winner", subtitle: "Qualification for the finals", Icon: Swords },
  { title: "Overall Tournament Jackpot", subtitle: "The championship prize pool", Icon: Crown },
];

export function GatewayTunnel() {
  const [tier, setTier] = useState<GatewayTierId>("gold");
  const [mode, setMode] = useState("wager");
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const selected = gatewaySelection(tier);
  const price = `$${selected.feeCents / 100}`;
  function selectTier(value: string) { setTier(gatewaySelection(value).id); }
  function goToStep(value: 1 | 2 | 3 | 4) { setStep(value); }

  return <main className="dark gateway-tunnel" data-step={step} data-mode={mode}>
    <div className="gateway-scenery" aria-hidden="true">
      <img src={step === 4 ? hardlockPlate.url : step === 3 ? checkoutPlate.url : mode === "rewards" ? registrationPlate.url : step === 1 ? selectionPlate.url : securityPlate.url} alt="" />
      {step === 2 && mode === "wager" && <video className="gateway-background-video" autoPlay loop muted playsInline poster={securityPlate.url} src={tunnelVideo.url} />}
    </div>
    <aside className="gateway-nav">
      <Link to="/" aria-label="AGN home"><AgnCrest /></Link>
      <nav aria-label="Gateway navigation">
        <Button asChild variant="ghost"><Link to="/">Home</Link></Button>
        <Button asChild variant="ghost"><Link to="/auth" search={{ mode: "signup" }}>Sign up</Link></Button>
        <Button asChild variant="ghost"><Link to="/auth" search={{ mode: "signin" }}>Sign in</Link></Button>
        <Button asChild variant="ghost"><Link to="/shop">Merch</Link></Button>
        <Button asChild variant="ghost"><Link to="/arena" search={{}}>Upcoming tournaments</Link></Button>
        <span className="gateway-nav-divider" />
        <Button variant="ghost" className={step === 1 ? "is-current" : ""} onClick={() => goToStep(1)} aria-current={step === 1 ? "step" : undefined}>The gateway</Button>
        <Button variant="ghost" className={step === 2 ? "is-current" : ""} disabled={mode !== "wager"} onClick={() => goToStep(2)} aria-current={step === 2 ? "step" : undefined}>Security check</Button>
        <Button variant="ghost" className={step === 3 ? "is-current" : ""} onClick={() => goToStep(3)} aria-current={step === 3 ? "step" : undefined}>Checkout preview</Button>
        <Button variant="ghost" className={step === 4 ? "is-current" : ""} onClick={() => goToStep(4)} aria-current={step === 4 ? "step" : undefined}>Hardlock preview</Button>
      </nav>
      <p>AGN · EWL GROUPS INC.<br />GLOBAL TOURNAMENT ARENA</p>
    </aside>
    <div className="gateway-content">
      <header className="gateway-heading">
        <span className="gateway-eyebrow">Global Tournament Arena</span>
        <h1>{step === 4 ? "The Final Hardlock" : step === 3 ? "The Checkout Tunnel" : step === 2 && mode === "wager" ? "Security Check" : "The Gateway Selection"}</h1>
        <ol className="gateway-steps" aria-label="Registration steps">
          <li aria-current={step === 1 ? "step" : undefined}><span>01</span> Gateway selection</li><ChevronRight aria-hidden="true" />
          <li aria-current={step === 2 ? "step" : undefined}><span>02</span> Security check</li><ChevronRight aria-hidden="true" />
          <li className="gateway-locked" aria-current={step === 3 ? "step" : undefined}><LockKeyhole aria-hidden="true" />{step === 3 ? "03 Checkout preview · payment locked" : "Payment locked"}</li><ChevronRight aria-hidden="true" />
          <li className="gateway-locked" aria-current={step === 4 ? "step" : undefined}><LockKeyhole aria-hidden="true" />{step === 4 ? "04 Hardlock preview · payment locked" : "Hardlock locked"}</li>
        </ol>
      </header>
      {step === 4 ? <HardlockPreview onBack={() => goToStep(1)} /> : step === 3 ? <CheckoutPreview onBack={() => goToStep(1)} /> : <Tabs value={mode} onValueChange={(value) => { setMode(value); setStep(1); }} className="gateway-tabs">
        <TabsList aria-label="Gateway mode"><TabsTrigger value="wager">Wager</TabsTrigger><TabsTrigger value="rewards">Rewards</TabsTrigger></TabsList>
        <TabsContent value="wager">
          {step === 1 ? <>
            <div className="gateway-section-heading"><span /> <h2>Choose your wager tier</h2> <span /></div>
            <div className="gateway-selection-layout">
              <div className="gateway-tier-scroll">
                <RadioGroup value={tier} onValueChange={selectTier} aria-label="Gateway wager tier" className="gateway-tiers">
                  {GATEWAY_TIERS.map((item) => <label key={item.id} className={`gateway-tier gateway-${item.id} ${item.id === tier ? "is-selected" : ""}`}>
                    <RadioGroupItem id={`gateway-${item.id}`} value={item.id} className="gateway-tier-radio" aria-label={`$${item.feeCents / 100} ${item.label} Gateway`} />
                    <strong>${item.feeCents / 100}</strong><span>{item.label}<br />Gateway</span>
                    <div className="gateway-badge" aria-hidden="true"><Shield /><Gem /></div>
                    <span className="gateway-tier-check" aria-hidden="true">{item.id === tier && <Check />}</span>
                  </label>)}
                </RadioGroup>
              </div>
              <aside className="gateway-summary" aria-label="Selected gateway wager" aria-live="polite" aria-atomic="true">
                <h2>Selected gateway wager</h2><strong>{price}</strong><h3>{selected.label} Gateway</h3>
                <div className={`gateway-badge gateway-${selected.id}`} aria-hidden="true"><Shield /><Gem /></div>
                <p>Initial Wager Payment</p><small>Proposed entry amount · No payment taken</small>
              </aside>
            </div>
            <div className="gateway-bottom">
              <section className="gateway-prize-preview" aria-label="Prize structure preview">
                <div className="gateway-section-heading"><span /><h2>Prize structure preview</h2><span /></div>
                <div className="gateway-prizes">{PRIZES.map(({ title, subtitle, Icon }) => <article key={title}><Icon aria-hidden="true" /><div><h3>{title}</h3><p>{subtitle}</p></div></article>)}</div>
                <p className="gateway-disclaimer">Potential winnings are not guaranteed. Eligibility, verified results and approved payout rules apply.</p>
              </section>
              <div className="gateway-proceed-column">
                <div className="gateway-multiplier"><strong>2X</strong><p><b>Prize Multiplier Preview</b><br />Proposed for eligible daily, qualifier and jackpot winnings. Your initial {price} selection stays unchanged.<small>Not applied until multiplier rules are approved.</small></p></div>
                <Button className="gateway-proceed" onClick={() => goToStep(2)}><LockKeyhole /><span>Proceed to security check</span><ChevronsRight /></Button>
              </div>
            </div>
            <p className="gateway-footer-note">18+ wagering only · Real ID and jurisdiction verification required</p>
          </> : <GatewaySecurity tier={tier} onBack={() => goToStep(1)} />}
        </TabsContent>
        <TabsContent value="rewards">
          <section className="gateway-rewards" aria-label="Tournament rewards">
            <div><Trophy className="gateway-security-icon" aria-hidden="true" /><span className="gateway-eyebrow">Player & Viewer Rewards</span><h2>Earn your place. Rise through the ranks.</h2><p>Recruit · Contender · Veteran · Elite · Master</p><Button asChild className="gateway-proceed"><Link to="/account"><UserRound />My rewards & profile<ChevronRight /></Link></Button><Button asChild variant="ghost"><Link to="/leaderboard">View leaderboard<ChevronRight /></Link></Button></div>
            <TournamentRegistration />
          </section>
        </TabsContent>
      </Tabs>}
    </div>
  </main>;
}