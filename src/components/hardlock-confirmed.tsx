import { OctagonAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import lockedOff from "@/assets/gateway/hardlock_locked_off.mp4.asset.json";

/** Real confirmation: only rendered once the saved entry shows a confirmed, paid seat. */
export function HardlockConfirmed({ title, onClose }: { title: string; onClose: () => void }) {
  return <section className="hardlock mt-8" aria-label="Registration confirmed">
    <div className="hardlock-chamber">
      <video className="hardlock-video motion-reduce:hidden" src={lockedOff.url} autoPlay muted playsInline preload="metadata" aria-hidden="true" />
      <h2 className="hardlock-title">The Final Hardlock</h2>
      <div className="hardlock-frame" role="status" aria-live="polite">
        <OctagonAlert className="hardlock-icon" aria-hidden="true" />
        <p className="hardlock-headline">REGISTRATION HARDLOCKED</p>
        <small>{title} · seat confirmed · +250 reward points</small>
      </div>
    </div>
    <Button variant="outline" onClick={onClose}>Continue to my account</Button>
  </section>;
}
