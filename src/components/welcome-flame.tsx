import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import flame from "@/assets/flow/agn_flame_welcome.mp4.asset.json";

// Shown after every completed sign-up, then hands off to the Overchat dashboard.
export function WelcomeFlame({ role }: { role: "spectator" | "competitor" }) {
  return (
    <div className="dark welcome-flame">
      <video className="welcome-flame-video" src={flame.url} autoPlay muted playsInline preload="auto" aria-hidden="true" />
      <div className="welcome-flame-copy">
        <p className="hub-eyebrow">WELCOME TO AETHER GAMING NETWORKS</p>
        <h1>{role === "competitor" ? "COMPETITOR" : "SPECTATOR"} ACCESS READY</h1>
        <p>Join Overchat, vote on next season's titles and follow every bracket.</p>
        <Button asChild size="lg"><Link to="/hub">ENTER THE DASHBOARD <ArrowRight /></Link></Button>
      </div>
    </div>
  );
}
