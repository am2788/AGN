import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CONSOLE_ASSET_IDS, getConsoleAsset } from "@/lib/console-assets.functions";
import { AgnSecurityBadge } from "@/components/agn-brand";

export const Route = createFileRoute("/console/assets/$asset")({
  head: () => ({
    meta: [
      { title: "Secure Console Artwork — AGN" },
      { name: "description", content: "Session-gated Canva artwork archive for AGN consoles." },
      { property: "og:title", content: "Secure Console Artwork — AGN" },
      { property: "og:description", content: "AGN console artwork archive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ConsoleAsset,
});

type SavedSkin = { poster: string; video: string; webm: string };
const LOCKED = "Sign in to your secure console to view saved Canva artwork.";

function ConsoleAsset() {
  const { asset } = Route.useParams();
  const fetchAsset = useServerFn(getConsoleAsset);
  const [skin, setSkin] = useState<SavedSkin | null>(null);
  const [status, setStatus] = useState("Checking console access…");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let active = true;
    setSkin(null);
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) { setLocked(true); setStatus(LOCKED); return; }
      if (!(CONSOLE_ASSET_IDS as readonly string[]).includes(asset)) { setStatus("Artwork not found."); return; }
      const result = await fetchAsset({ data: { asset: asset as (typeof CONSOLE_ASSET_IDS)[number] } });
      if (!active) return;
      setSkin(result);
      setStatus("");
    };
    void load().catch(() => { if (active) setStatus("Console access unavailable. Please try again."); });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") { setSkin(null); setLocked(true); setStatus(LOCKED); }
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [asset, fetchAsset]);

  return (
    <main className="dark flex min-h-screen flex-col items-center justify-center gap-6 bg-vault-bg px-6 py-12 font-body text-foreground">
      <div className="w-full max-w-5xl"><AgnSecurityBadge /></div>
      <Link to="/console" className="text-xs tracking-[0.3em] text-muted-foreground uppercase">← Console</Link>
      <h1 className="font-display text-2xl text-gold">Console Artwork Archive</h1>
      {skin ? (
        <video aria-label="Saved Canva console artwork" controls playsInline preload="metadata" poster={skin.poster} className="max-h-[75vh] w-full max-w-5xl object-contain">
          <source src={skin.webm} type="video/webm" />
          <source src={skin.video} type="video/mp4" />
        </video>
      ) : (
        <div className="text-center">
          <LockKeyhole className="mx-auto mb-4 h-6 w-6 text-crimson" />
          <p className="text-sm text-muted-foreground">{status}</p>
          {locked && <Link to="/auth" className="mt-4 inline-block rounded-md bg-crimson px-5 py-2 font-display text-sm tracking-widest">SIGN IN</Link>}
        </div>
      )}
    </main>
  );
}
