import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { streamImage } from "@/lib/stream-image";
import { saveForgedAvatar } from "@/lib/participant.functions";
export function AvatarForge({ points, onSaved }: { points: number; onSaved: () => void }) {
  const [prompt, setPrompt] = useState(""); const [image, setImage] = useState(""); const [final, setFinal] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [paused, setPaused] = useState(false);
  const save = useServerFn(saveForgedAvatar);
  async function forge(e: React.FormEvent) {
    e.preventDefault(); if (paused || busy) return;
    setBusy(true); setFinal(false); setImage(""); setMessage("");
    try {
      const { data } = await supabase.auth.getSession(); if (!data.session) throw new Error("Sign in to use Avatar Forge.");
      let completed = "";
      await streamImage("/api/avatar-forge", { prompt }, (frame, done) => { setImage(frame); setFinal(done); if (done) completed = frame; }, undefined, { Authorization: `Bearer ${data.session.access_token}` });
      if (!completed) throw new Error("No completed avatar was returned.");
      await save({ data: { image: completed } }); setMessage("Avatar forged and saved to your profile."); onSaved();
    } catch (err) { setMessage(err instanceof Error ? err.message : "Avatar generation failed."); setPaused(true); }
    finally { setBusy(false); }
  }
  return <section className="border-t border-wager-line/30 py-6"><h2 className="flex items-center gap-2 font-display text-lg text-gold">{points >= 10000 ? <Sparkles /> : <LockKeyhole />} AI Avatar Forge</h2>{points < 10000 ? <p className="mt-3 text-sm text-muted-foreground">Master unlock · {points.toLocaleString()} / 10,000 points</p> : <form onSubmit={forge} className="mt-4 max-w-xl space-y-4"><label htmlFor="avatar-vision" className="text-sm text-gold">Avatar vision</label><textarea id="avatar-vision" placeholder="Describe your custom avatar vision..." value={prompt} onChange={(e) => setPrompt(e.target.value)} required minLength={3} maxLength={1500} className="min-h-28 w-full rounded-sm border border-input bg-vault-panel p-3" /><Button type="submit" disabled={busy || paused} className="bg-crimson text-foreground hover:bg-crimson/80"><Sparkles />{busy ? "Forging avatar…" : "Forge with Gemini"}</Button>{image && <img src={image} alt="Your custom avatar" className={`aspect-square w-64 max-w-full rounded-sm object-cover transition-[filter] ${final ? "blur-0" : "blur-2xl"}`} />}{message && <p role="status" className="text-sm text-gold">{message}</p>}</form>}</section>;
}