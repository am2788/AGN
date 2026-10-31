import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import "@lovable.dev/cloud-auth-js/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { AgnCrest } from "@/components/agn-brand";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: "signup" | "signin" } => ({ mode: search["mode"] === "signup" ? "signup" : "signin" }),
  head: () => ({
    meta: [
      { title: "Player & Viewer Sign In — AGN" },
      { name: "description", content: "Create an account or sign in to your AGN player or viewer account." },
      { property: "og:title", content: "Player & Viewer Sign In — AGN" },
      { property: "og:description", content: "Sign up or sign in to view your AGN profile and saved entries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  useEffect(() => setMode(search.mode ?? "signin"), [search.mode]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) void navigate({ to: "/account", replace: true });
    });
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (error) return setMessage(error.message);
      if (data.session) return void navigate({ to: "/account" });
      return setMessage("Check your email to confirm your account, then sign in.");
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setMessage(error.message);
    void navigate({ to: "/account" });
  };

  async function socialSignIn(provider: "google" | "lovable") {
    setBusy(true); setMessage(null);
    try {
      window.sessionStorage.setItem("agn-auth-return", "/account");
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) { setMessage(result.error.message); return; }
      if (!result.redirected) void navigate({ to: "/account" });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Sign-in failed. Please retry."); }
    finally { setBusy(false); }
  }
  const field = "mt-1.5 w-full rounded-sm border border-wager-line/40 bg-vault-bg/80 px-3 py-2.5 font-mono text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus-visible:border-crimson focus-visible:ring-2 focus-visible:ring-crimson/40";
  return (
    <main className="dark vault-grain relative flex min-h-screen items-center justify-center overflow-hidden bg-vault-bg px-4 py-10 font-body text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-crimson)_22%,transparent),transparent_60%)]" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground uppercase hover:text-gold focus-visible:outline-2 focus-visible:outline-crimson">← Arena</Link>
        <div className="animate-pulse-border mt-3 rounded-sm border border-wager-line/50 bg-vault-panel/95 p-6 shadow-2xl sm:p-8">
          <div className="mx-auto w-48"><AgnCrest prominent /></div>
          <p className="mt-4 text-center font-mono text-[10px] tracking-[0.35em] text-crimson uppercase">// Secure access terminal</p>
          <div role="tablist" aria-label="Account mode" className="mt-5 grid grid-cols-2 rounded-sm border border-wager-line/40 p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setMessage(null); }}
                className={`whitespace-nowrap rounded-sm px-1 py-2 font-display text-[11px] font-bold tracking-[0.08em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-crimson sm:text-xs sm:tracking-[0.2em] ${mode === m ? "bg-crimson text-foreground" : "text-muted-foreground hover:text-gold"}`}>
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          <h1 className="text-glow-gold mt-6 text-center font-display text-2xl font-bold tracking-widest text-gold">
            {mode === "signup" ? "JOIN THE ARENA" : "WELCOME BACK"}
          </h1>
          <p className="mt-1 text-center text-xs text-muted-foreground">Players and viewers 13+ · Aether Gaming Networks</p>
          <div className="mt-6 grid gap-3">
            <Button type="button" variant="outline" disabled={busy} onClick={() => void socialSignIn("google")} className="border-wager-line/50 hover:border-gold">Continue with Google</Button>
            <Button type="button" className="lovable-auth-button" disabled={busy} onClick={() => void socialSignIn("lovable")}>Continue with Lovable</Button>
          </div>
          <div className="my-6 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-wager-line/30" />or email<span className="h-px flex-1 bg-wager-line/30" />
          </div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block font-mono text-[11px] tracking-[0.2em] text-gold/90 uppercase">
              Email
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
            </label>
            <label className="block font-mono text-[11px] tracking-[0.2em] text-gold/90 uppercase">
              Password
              <input type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
            </label>
            {message && <p role="status" className="rounded-sm border border-amber-alert/40 px-3 py-2 text-sm text-amber-alert">{message}</p>}
            <Button type="submit" disabled={busy}
              className="glow-crimson w-full rounded-sm bg-crimson py-3 font-display text-sm font-bold tracking-widest text-foreground hover:bg-crimson/90 disabled:opacity-60">
              {busy ? "…" : mode === "signup" ? "CREATE ACCOUNT" : "ENTER THE ARENA"}
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">EWL Groups Inc. · topgamer.gg</p>
      </div>
    </main>
  );
}
