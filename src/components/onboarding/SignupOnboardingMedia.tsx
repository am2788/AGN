import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import "./signup-onboarding.css";

type SignupResult = { userId: string; threadId?: string };
type Props = {
  ambienceUrl: string;
  landingLoopUrl?: string;
  welcomeVideoUrl: string;
  children: (controls: { completeSignup: (submit: () => Promise<SignupResult>) => Promise<void>; enableSound: () => Promise<void>; submitting: boolean }) => ReactNode;
  /** Server-side, idempotent operation that creates AETHER friend #1 and the official message. */
  ensureAetherFriend: (userId: string) => Promise<{ threadId: string }>;
  openMessenger: (threadId: string) => void;
};
type HandoffState = "signup" | "welcome" | "blocked" | "done";

/** Keep this component mounted across all signup steps to preserve the single ambience loop. */
export function SignupOnboardingMedia({ ambienceUrl, landingLoopUrl, welcomeVideoUrl, children, ensureAetherFriend, openMessenger }: Props) {
  const ambience = useRef<HTMLAudioElement>(null);
  const landingVideo = useRef<HTMLVideoElement>(null);
  const welcomeVideo = useRef<HTMLVideoElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<HandoffState>("signup");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) landingVideo.current?.pause();
    void ambience.current?.play().catch(() => setMediaError("Tap Enable Sound to start signup ambience."));
    return () => {
      ambience.current?.pause();
      landingVideo.current?.pause();
      welcomeVideo.current?.pause();
    };
  }, []);

  const enableSound = useCallback(async () => {
    setMediaError(null);
    try { await ambience.current?.play(); }
    catch { setMediaError("Audio playback was blocked. Interact with the page and try again."); }
  }, []);

  const finishWelcome = useCallback(() => {
    const player = welcomeVideo.current;
    if (state === "done") return;
    player?.pause();
    if (player) player.currentTime = 0;
    setState("done");
    if (threadId) openMessenger(threadId);
  }, [openMessenger, state, threadId]);

  const completeSignup = useCallback(async (submit: () => Promise<SignupResult>) => {
    if (submitting || state !== "signup") return;
    setSubmitting(true);
    setMediaError(null);
    try {
      const result = await submit();
      // Backend operation must be idempotent; retries/refreshes return the same welcome thread.
      const provisioned = await ensureAetherFriend(result.userId);
      const resolvedThreadId = result.threadId ?? provisioned.threadId;
      setThreadId(resolvedThreadId);
      // Hard handoff: silence all signup media before starting the welcome clip.
      if (ambience.current) { ambience.current.pause(); ambience.current.currentTime = 0; }
      if (landingVideo.current) { landingVideo.current.pause(); landingVideo.current.currentTime = 0; }
      const player = welcomeVideo.current;
      if (!player) throw new Error("Welcome video is unavailable");
      player.currentTime = 0;
      setState("welcome");
      try { await player.play(); }
      catch {
        setState("blocked");
        setMediaError("Tap Play Welcome to continue.");
      }
    } catch (error) {
      // Signup form stays mounted; caller retains input values for validation/retry.
      setMediaError(error instanceof Error ? error.message : "Signup could not be completed.");
    } finally { setSubmitting(false); }
  }, [ensureAetherFriend, state, submitting]);

  const playWelcome = useCallback(async () => {
    try {
      setMediaError(null);
      setState("welcome");
      await welcomeVideo.current?.play();
    } catch { setMediaError("Welcome video playback is blocked. Use Skip to continue."); }
  }, []);

  return (
    <div className="agn-signup-media" data-handoff={state}>
      {landingLoopUrl && <video ref={landingVideo} className="agn-signup-media__background" src={landingLoopUrl} autoPlay loop muted playsInline aria-hidden="true" />}
      <audio ref={ambience} src={ambienceUrl} loop preload="auto" />
      <video ref={welcomeVideo} className="agn-signup-media__welcome" src={welcomeVideoUrl} playsInline preload="auto" onEnded={finishWelcome} aria-label="Welcome to AGN" />
      {children({ completeSignup, enableSound, submitting })}
      {mediaError && <p role="status" className="agn-signup-media__status">{mediaError}</p>}
      {state === "signup" && mediaError?.includes("Enable Sound") && <button type="button" onClick={() => void enableSound()}>Enable Sound</button>}
      {(state === "welcome" || state === "blocked") && (
        <div className="agn-signup-media__handoff" role="dialog" aria-modal="true" aria-label="Welcome to AGN">
          {state === "blocked" && <button type="button" onClick={() => void playWelcome()}>Play Welcome</button>}
          <button type="button" onClick={finishWelcome}>Skip</button>
        </div>
      )}
    </div>
  );
}
