import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { xanoLogin, xanoSignup } from "@/lib/xano.functions";
import { useIsMobile } from "@/hooks/use-mobile";
import { SkinScreen } from "./skin/SkinScreen";
import { applyTheme } from "@/lib/theme";

export function XanoOnboarding({ signup = true }: { signup?: boolean }) {
  const mobile = useIsMobile();
  const register = useServerFn(xanoSignup);
  const login = useServerFn(xanoLogin);
  const navigate = useNavigate();
  const audio = useRef<HTMLAudioElement>(null);
  const loop = useRef<HTMLVideoElement>(null);
  const welcome = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [muted, setMuted] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaError, setMediaError] = useState(false);
  const base = (import.meta.env["VITE_SKINS_CDN_BASE"] as string | undefined)?.replace(/\/$/, "");
  const stopLoops = () => {
    for (const media of [audio.current, loop.current]) {
      if (media) {
        media.pause();
        media.currentTime = 0;
      }
    }
  };
  useEffect(() => {
    const audioElement = audio.current;
    const videoElement = loop.current;
    const greeting = welcome.current;
    return () => {
      audioElement?.pause();
      videoElement?.pause();
      greeting?.pause();
    };
  }, []);
  async function startMedia() {
    if (!signup || complete || !base) return;
    try {
      await audio.current?.play();
      await loop.current?.play();
    } catch {
      setMessage("Your browser paused media. Use Enable ambience to retry, or continue silently.");
    }
  }
  async function enterChat() {
    await navigate({ to: "/overchat" });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (signup && step < 3) {
      setStep((value) => value + 1);
      void startMedia();
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if (signup) await register({ data: { name, email, password } });
      else await login({ data: { email, password } });
      setPassword("");
      stopLoops();
      window.dispatchEvent(new Event("agn-xano-session"));
      if (!signup) {
        await navigate({ to: "/dashboard" });
        return;
      }
      applyTheme("simple-gold");
      setComplete(true);
      // The greeting is mounted throughout; play only after confirmed registration.
      try {
        await welcome.current?.play();
      } catch {
        setMessage("Press Play welcome to begin the greeting, or Continue to chat.");
      }
    } catch {
      setMessage(
        "Account request could not be completed. Check your details and the configured Xano service before retrying.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <SkinScreen screen={signup ? (step === 0 ? "hall-collapsed" : "hall-open") : "signin"}>
      <main className="mx-auto max-w-xl rounded border bg-background/95 p-6 text-foreground">
        <h1>{signup ? "Join Aether Gaming Networks" : "Sign in to AGN"}</h1>
        {signup && base && (
          <>
            <audio
              ref={audio}
              src={`${base}/media/signup-ambience-16s.mp3`}
              loop
              muted={muted}
              preload="none"
              onError={() => setMediaError(true)}
            />
            <video
              ref={loop}
              hidden={complete}
              src={`${base}/media/signup-loop-${mobile ? "mob" : "desk"}.mp4`}
              loop
              muted
              playsInline
              preload="none"
              aria-label="Sign-up atmosphere"
              onError={() => setMediaError(true)}
            />
            <video
              ref={welcome}
              hidden={!complete}
              src={`${base}/media/welcome-to-agn.mp4`}
              controls
              playsInline
              preload="none"
              aria-label="Welcome to AGN"
              onEnded={() => void enterChat()}
              onError={() => setMediaError(true)}
            />
          </>
        )}
        {complete ? (
          <section aria-live="polite">
            <h2>Welcome to AGN</h2>
            <p>Your account has been created. Thank you for joining our community.</p>
            <button
              type="button"
              onClick={() =>
                void welcome.current
                  ?.play()
                  .catch(() => setMessage("Greeting unavailable. You can continue to chat."))
              }
            >
              Play welcome
            </button>
            <button type="button" onClick={() => void enterChat()}>
              Continue to chat
            </button>
          </section>
        ) : (
          <>
            {signup && (
              <>
                <p>Step {step + 1} of 4</p>
                <button type="button" onClick={() => void startMedia()}>
                  Enable ambience
                </button>
                <button
                  type="button"
                  aria-pressed={muted}
                  onClick={() => setMuted((value) => !value)}
                >
                  {muted ? "Unmute ambience" : "Mute ambience"}
                </button>
              </>
            )}
            <form onSubmit={(event) => void submit(event)}>
              <fieldset hidden={!signup || step !== 0}>
                <legend>1. Your public name</legend>
                <label>
                  Display name
                  <input
                    aria-label="Display name"
                    required={signup && step === 0}
                    minLength={2}
                    maxLength={60}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              </fieldset>
              <fieldset hidden={signup && step !== 1}>
                <legend>{signup ? "2. Contact" : "Account"}</legend>
                <label>
                  Email
                  <input
                    aria-label="Email"
                    type="email"
                    autoComplete="email"
                    required={!signup || step === 1}
                    maxLength={255}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </fieldset>
              <fieldset hidden={signup && step !== 2}>
                <legend>{signup ? "3. Secure access" : "Password"}</legend>
                <label>
                  Password
                  <input
                    aria-label="Password"
                    type="password"
                    autoComplete={signup ? "new-password" : "current-password"}
                    required={!signup || step === 2}
                    minLength={8}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              </fieldset>
              {signup && (
                <fieldset hidden={step !== 3}>
                  <legend>4. Confirm</legend>
                  <p>
                    Joining does not purchase a tournament slot, verify identity, or grant payment
                    rewards.
                  </p>
                  <label>
                    <input
                      type="checkbox"
                      checked={accepted}
                      required={step === 3}
                      onChange={(e) => setAccepted(e.target.checked)}
                    />
                    I am 13 or older and understand competition eligibility is verified separately.
                  </label>
                </fieldset>
              )}
              {signup && step > 0 && (
                <button type="button" disabled={busy} onClick={() => setStep((value) => value - 1)}>
                  Back
                </button>
              )}
              <button type="submit" disabled={busy}>
                {busy
                  ? "Submitting…"
                  : signup && step < 3
                    ? "Next"
                    : signup
                      ? "Create account"
                      : "Sign in"}
              </button>
            </form>
            <p>
              <Link to="/legacy-auth">Existing Supabase account sign-in</Link>
            </p>
            <Link to={signup ? "/auth" : "/signup"}>
              {signup ? "Already a member? Sign in" : "Create account"}
            </Link>
          </>
        )}
        {(!base || mediaError) && signup && (
          <p role="status">
            Original onboarding media is not available. Registration can continue without playback.
          </p>
        )}
        {message && <p role="status">{message}</p>}
      </main>
    </SkinScreen>
  );
}
