import { ArrowLeft, LockKeyhole, OctagonAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import lockedOff from "@/assets/gateway/hardlock_locked_off.mp4.asset.json";
import { HARDLOCK_HEADLINE, hardlockPreviewState } from "@/lib/hardlock";

export function HardlockPreview({ onBack }: { onBack: () => void }) {
  const state = hardlockPreviewState();
  return <section className="hardlock" aria-label="Final hardlock visual preview">
    <div className="checkout-preview-notice"><LockKeyhole /><p><strong>Visual preview only</strong> · No payment has been confirmed, so no registration is hardlocked and no token exists. This shows how the confirmation screen will look.</p></div>
    <div className="hardlock-chamber">
      <video className="hardlock-video" src={lockedOff.url} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
      <h2 className="hardlock-title">The Final Hardlock</h2>
      <div className="hardlock-frame" role="status" aria-live="polite">
        <OctagonAlert className="hardlock-icon" aria-hidden="true" />
        <p className="hardlock-headline">{HARDLOCK_HEADLINE}</p>
        <small>Example confirmation appearance — not an actual payment or registration result</small>
      </div>
      <p className="checkout-note">Triggered only after a real payment confirmation. Payments are not connected{state.paymentConfirmed ? "" : ", so this state cannot occur yet"}.</p>
    </div>
    <Button asChild variant="outline"><Link to="/welcome" search={{ role: "competitor" }}>Preview welcome screen</Link></Button>
    <Button variant="ghost" onClick={onBack}><ArrowLeft />Back to gateway selection</Button>
  </section>;
}
