import { createEqEngine, EQ_FREQUENCIES, type EqEngine } from "@/lib/audio/eq-engine";
import { useEffect, useRef, useState } from "react";
import { ListMusic, Pause, Play, SkipBack, SkipForward, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import eqPlate from "@/assets/flow/adjustable_eq.png.asset.json";
import pulseVideo from "@/assets/flow/media_player_pulse.mp4.asset.json";

export function ArenaMediaDeck() {
  const audio = useRef<HTMLAudioElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<{ name: string; url: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [error, setError] = useState("");
  const track = tracks[index];
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const pulse = useRef<HTMLVideoElement>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const engine = useRef<EqEngine | null>(null);
  const trackUrls = useRef<string[]>([]);
  const [gains, setGains] = useState<number[]>(EQ_FREQUENCIES.map(() => 0));
  const [qs, setQs] = useState<number[]>(EQ_FREQUENCIES.map(() => 1));
  const [boost, setBoost] = useState(1);
  const [low, setLow] = useState(20);
  const [high, setHigh] = useState(20000);
  // LED bars follow the actual music via the Web Audio analyser.
  useEffect(() => {
    if (!playing || !audio.current) {
      pulse.current?.pause();
      return;
    }
    void pulse.current?.play().catch(() => undefined);
    if (!analyser.current) return;
    const node = analyser.current;
    const data = new Uint8Array(node.frequencyBinCount);
    let raf = 0;
    const draw = () => {
      node.getByteFrequencyData(data);
      bars.current.forEach((b, i) => {
        if (b) b.style.height = `${Math.max(6, ((data[i % data.length] ?? 0) / 255) * 100)}%`;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  useEffect(
    () => () => {
      trackUrls.current.forEach((url) => URL.revokeObjectURL(url));
      engine.current?.dispose();
    },
    [],
  );
  function skip(direction: number) {
    if (!tracks.length) return;
    setIndex((index + direction + tracks.length) % tracks.length);
    setPlaying(false);
  }
  async function toggle() {
    if (!audio.current || !track) return;
    if (playing) audio.current.pause();
    else
      try {
        if (!engine.current) {
          engine.current = createEqEngine(audio.current);
          analyser.current = engine.current.analyser;
        }
        gains.forEach((gain, i) => engine.current!.setBand(i, { gain, q: qs[i] ?? 1 }));
        engine.current.setBoost(boost);
        engine.current.setCuts(low, high);
        await engine.current.context.resume();
        await audio.current.play();
        setError("");
      } catch {
        setError("This audio file could not be played.");
      }
  }
  return (
    <section
      className="shell-frame shell-media media-player-skin"
      aria-label="Media player"
      style={{
        backgroundImage: `linear-gradient(color-mix(in oklab, var(--background) 78%, transparent), color-mix(in oklab, var(--background) 88%, transparent)), url(${eqPlate.url})`,
      }}
    >
      <video
        ref={pulse}
        className="media-pulse-video"
        src={pulseVideo.url}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="shell-panel-title">
        <h2>MEDIA PLAYER</h2>
        <span>LOCAL AUDIO</span>
      </div>
      <p className="shell-track">{track?.name ?? "NEON CIRCUIT // AETHER"}</p>
      {!track && <p className="shell-note">No official playlist connected</p>}
      <div className={`shell-equalizer ${playing ? "is-playing" : ""}`} aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            ref={(el) => {
              bars.current[i] = el;
            }}
          />
        ))}
      </div>
      <audio
        ref={audio}
        src={track?.url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => skip(1)}
        onError={() => {
          setPlaying(false);
          setError("This audio file could not be played.");
        }}
      />
      <div className="shell-media-controls">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous track"
          title="Previous track"
          disabled={!track}
          onClick={() => skip(-1)}
        >
          <SkipBack />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={playing ? "Pause audio" : "Play audio"}
          title={playing ? "Pause audio" : "Play audio"}
          disabled={!track}
          onClick={() => void toggle()}
        >
          {playing ? <Pause /> : <Play />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next track"
          title="Next track"
          disabled={!track}
          onClick={() => skip(1)}
        >
          <SkipForward />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Playlist queue"
          title="Playlist queue"
          aria-expanded={queueOpen}
          onClick={() => setQueueOpen(!queueOpen)}
        >
          <ListMusic />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Add local audio"
          title="Add local audio"
          onClick={() => fileInput.current?.click()}
        >
          <Upload />
        </Button>
        <input
          hidden
          ref={fileInput}
          type="file"
          accept="audio/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (!files.length) return;
            audio.current?.pause();
            trackUrls.current.forEach((url) => URL.revokeObjectURL(url));
            const next = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
            trackUrls.current = next.map((item) => item.url);
            setTracks(next);
            setIndex(0);
            setPlaying(false);
            setQueueOpen(true);
          }}
        />
      </div>
      {queueOpen && (
        <ul className="shell-playlist">
          {tracks.length ? (
            tracks.map((item, i) => (
              <li key={item.url}>
                <Button
                  variant="ghost"
                  aria-pressed={i === index}
                  onClick={() => {
                    setIndex(i);
                    setPlaying(false);
                  }}
                >
                  {String(i + 1).padStart(2, "0")} · {item.name}
                </Button>
              </li>
            ))
          ) : (
            <li>Playlist empty</li>
          )}
        </ul>
      )}
      <details>
        <summary>10-band parametric EQ</summary>
        <div className="eq-controls">
          {EQ_FREQUENCIES.map((frequency, i) => (
            <label key={frequency}>
              {frequency} Hz
              <input
                aria-label={`${frequency} Hz gain`}
                type="range"
                min={-18}
                max={18}
                step={0.5}
                value={gains[i]}
                onChange={(e) => {
                  const gain = Number(e.target.value);
                  setGains((old) => old.map((v, index) => (index === i ? gain : v)));
                  engine.current?.setBand(i, { gain });
                }}
              />
              <output>{gains[i]} dB</output>
              <input
                aria-label={`${frequency} Hz Q`}
                type="number"
                min={0.1}
                max={18}
                step={0.1}
                value={qs[i]}
                onChange={(e) => {
                  const q = Math.max(0.1, Math.min(18, Number(e.target.value) || 1));
                  setQs((old) => old.map((v, index) => (index === i ? q : v)));
                  engine.current?.setBand(i, { q });
                }}
              />
            </label>
          ))}
          <label>
            Output boost
            <input
              aria-label="Output boost"
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={boost}
              onChange={(e) => {
                const value = Number(e.target.value);
                setBoost(value);
                engine.current?.setBoost(value);
              }}
            />
            <output>{Math.round(boost * 100)}%</output>
          </label>
          <label>
            Low-cut Hz
            <input
              aria-label="Low-cut frequency"
              type="range"
              min={20}
              max={1000}
              value={low}
              onChange={(e) => {
                const value = Number(e.target.value);
                setLow(value);
                engine.current?.setCuts(value, high);
              }}
            />
          </label>
          <label>
            High-cut Hz
            <input
              aria-label="High-cut frequency"
              type="range"
              min={2000}
              max={20000}
              value={high}
              onChange={(e) => {
                const value = Number(e.target.value);
                setHigh(value);
                engine.current?.setCuts(low, value);
              }}
            />
          </label>
        </div>
        <p>
          Compressor-protected output, maximum 200%. Start quietly; a compressor cannot guarantee
          hearing safety or zero transient clipping.
        </p>
      </details>
      {error && (
        <p role="alert" className="shell-note">
          {error}
        </p>
      )}
    </section>
  );
}
