import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Eye, OctagonAlert, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AgnCrest } from "@/components/agn-brand";
import { supabase } from "@/integrations/supabase/client";
import { SPECTATOR_MIN_AGE } from "@/lib/season-vote";
import overlay from "@/assets/flow/spectator_overlay.mp4.asset.json";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join AGN — Competitor or Spectator Sign Up" },
      { name: "description", content: "Sign up as a competitor through the Gateway, or as a spectator (13+) to watch, chat and vote." },
      { property: "og:title", content: "Join AGN — Competitor or Spectator Sign Up" },
      { property: "og:description", content: "Watch. Connect. Vote. Follow. Relive. Join Aether Gaming Networks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JoinPage,
});

type Status = "input" | "accepted" | "declined";

function JoinPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(false);
  const [terms, setTerms] = useState(false);
  const [status, setStatus] = useState<Status>("input");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!age || !terms || name.trim().length < 2) {
      setStatus("declined");
      setMessage(`Enter a display name and confirm you are ${SPECTATOR_MIN_AGE} or older and accept the Terms.`);
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/welcome`, data: { display_name: name.trim().slice(0, 32), account_type: "spectator" } },
    });
    setBusy(false);
    if (error) { setStatus("declined"); setMessage(error.message); return; }
    if (data.session) { void navigate({ to: "/welcome", search: { role: "spectator" } }); return; }
    setStatus("accepted");
    setMessage("Confirm your email, then sign in to enter the dashboard.");
  }

  return (
    <div className="dark join-page">
      <video className="join-overlay" src={overlay.url} autoPlay muted loop playsInline aria-hidden="true" />
      <main className="join-main">
        <div className="join-crest"><AgnCrest /></div>
        <section className="join-card join-competitor">
          <Swords aria-hidden="true" />
          <h2>COMPETITOR / WAGER</h2>
          <p>Pick your tier, pass the security check and lock your bracket slot through the Gateway.</p>
          <Button asChild variant="outline"><Link to="/gateway">ENTER THE GATEWAY</Link></Button>
        </section>
        <section className={`join-card join-spectator is-${status}`} aria-live="polite">
          <p className="hub-eyebrow">SPECTATOR SIGN UP · AGES {SPECTATOR_MIN_AGE}+</p>
          <h1>WATCH. CONNECT. VOTE. FOLLOW. RELIVE.</h1>
          {status === "accepted" ? (
            <div className="join-state"><CheckCircle2 aria-hidden="true" /><h2>SPECTATOR ACCOUNT CREATED</h2><p>{message}</p><Button asChild><Link to="/auth" search={{ mode: "signin" }}>SIGN IN</Link></Button></div>
          ) : (
            <form onSubmit={submit} className="join-form">
              {status === "declined" && <div className="join-banner" role="alert"><OctagonAlert aria-hidden="true" />SPECTATOR SIGN UP NOT ACCEPTED — {message}</div>}
              <Label htmlFor="sp-name">Display name</Label>
              <Input id="sp-name" value={name} maxLength={32} onChange={(e) => setName(e.target.value)} required />
              <Label htmlFor="sp-email">Email</Label>
              <Input id="sp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Label htmlFor="sp-pass">Password</Label>
              <Input id="sp-pass" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <label className="join-check"><Checkbox checked={age} onCheckedChange={(v) => setAge(v === true)} />I am {SPECTATOR_MIN_AGE} years of age or older</label>
              <label className="join-check"><Checkbox checked={terms} onCheckedChange={(v) => setTerms(v === true)} />I agree to the Terms of Service and Privacy Policy</label>
              <Button type="submit" disabled={busy}><Eye />{busy ? "CREATING…" : "CREATE SPECTATOR ACCOUNT"}</Button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
