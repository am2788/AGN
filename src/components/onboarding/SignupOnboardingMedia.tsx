import { useCallback, useEffect, useRef, useState } from "react";

type SignupResult = { userId: string; threadId?: string };
type Props = {
  ambienceUrl: string;
  landingLoopUrl?: string;
  welcomeVideoUrl: string;
  children: (controls: { completeSignup: (submit: () => Promise<SignupResult>) => Promise<void>; enableSound: () => Promise<void>; submitting: boolean }) => React.ReactNode;
  /** Must call server-side, idempotent onboarding provisioning for Aether and the welcome message. */
  ensureAetherFriend: (userId: string) => Promise<{ threadId: string }>;
  openMessenger: (threadId: string) => void;
};

type HandoffState = "signup" | "welcome" | "blocked" | "done";

/** Keeps the signup tree mounted while ambience runs; successful signup has a single-audio handoff. */
export function SignupOnboardingMedia({ ambienceUrl, landingLoopUrl, welcomeVideoUrl, children, ensureAetherFriend, openMessenger }: Props) {
  const ambience = useRef<HTMLAudioElement>(null);
  const landingVideo = useRef<HTMLVideoElement>(null);
  const welcomeVideo = useRef<HTMLVideoElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<HandoffState>("signup");
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced && landingVideo.current) landingVideo.current.pause();
    // Autoplay with sound may be blocked. Explicit Enable Sound provides the user gesture.
    if (!reduced) void ambience.current?.play().catch(() => setMediaError("Tap Enable Sound to start signup ambience."));
  }, []);

  const enableSound = useCallback(async () => {
    setMediaError(null);
    try {
      await ambience.current?.play();
    } catch {
      setMediaError("Audio playback was blocked by the browser. Try again after interacting with the page.");
    }
  }, []);

  const finishWelcome = useCallback(() => {
    if (state === "done") return;
    setState("done");
    const threadId = welcomeVideo.current?.dataset.threadId;
    if (threadId) openMessenger(threadId);
  }, [openMessenger, state]);

  const completeSignup = useCallback(async (submit: () => Promise<SignupResult>) => {
    if (submitting || state !== "signup") return;
    setSubmitting(true);
    setMediaError(null);
    try {
      const result = await submit();
      const thread = await ensureAetherFriend(result.userId);
      // Stop every landing audio/video source before the welcome clip can produce sound.
      if (ambience.current) { ambience.current.pause(); ambience.current.currentTime = 0; }
      if (landingVideo.current) { landingVideo.current.pause(); landingVideo.current.currentTime = 0; }
      const player = welcomeVideo.current;
      if (!player) throw new Error("Welcome video element is unavailable");
      player.dataset.threadId = result.threadId ?? thread.threadId;
      player.currentTime = 0;
      setState("welcome");
      try {
        await player.play();
      } catch {
        setState("blocked");
        setMediaError("Tap Play Welcome to continue.");
      }
    } catch (error) {
      // The form remains mounted, allowing the caller to preserve its entered fields.
      setMediaError(error instanceof Error ? error.message : "Signup could not be completed.");
    } finally {
      setSubmitting(false);
    }
  }, [ensureAetherFriend, state, submitting]);

  const playWelcome = useCallback(async () => {
    const player = welcomeVideo.current;
    if (!player) return;
    try {
      setMediaError(null);
      setState("welcome");
      await player.play();
    } catch {
      setMediaError("Welcome video playback is still blocked. Check your browser media settings.");
    }
  }, []);

  return (
    <div className="agn-signup-media" data-handoff={state}>
      {landingLoopUrl && <video ref={landingVideo} className="agn-signup-media__background" src={landingLoopUrl} autoPlay loop muted playsInline aria-hidden="true" />}
      <audio ref={ambience} src={ambienceUrl} loop preload="auto" />
      <video
        ref={welcomeVideo}
        className="agn-signup-media__welcome"
        src={welcomeVideoUrl}
        playsInline
        preload="auto"
        onEnded={finishWelcome}
        aria-label="Welcome to AGN"
      />
      {children({ completeSignup, enableSound, submitting })}
      {mediaError && <p role="status" className="agn-signup-media__status">{mediaError}</p>}
      {(state === "welcome" || state === "blocked") && (
        <div className="agn-signup-media__handoff" role="dialog" aria-modal="true" aria-label="Welcome to AGN">
          {state === "blocked" && <button type="button" onClick={() => void playWelcome()}>Play Welcome</button>}
          <button type="button" onClick={finishWelcome}>Skip</button>
        </div>
      )}
      {state === "signup" && mediaError?.includes("Enable Sound") && <button type="button" onClick={() => void enableSound()}>Enable Sound</button>}
    </div>
  );
}
