import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createEqEngine, EQ_FREQUENCIES, type EqEngine } from "../../lib/audio/eq-engine";

/** Local-file player and parametric rack. External embeds cannot be routed through this graph. */
export function MediaDeckPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const engineRef = useRef<EqEngine | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [gains, setGains] = useState<number[]>(Array(10).fill(0));
  const [enabled, setEnabled] = useState<boolean[]>(Array(10).fill(true));
  const [boostPercent, setBoostPercent] = useState(100);
  const [muted, setMuted] = useState(false);
  const [solo, setSolo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    engineRef.current?.dispose();
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/audio\/(mpeg|wav|x-wav|wave)/i.test(file.type) && !/\.(mp3|wav)$/i.test(file.name)) {
      setError("Choose a local MP3 or WAV audio file.");
      return;
    }
    engineRef.current?.dispose();
    engineRef.current = null;
    setFileUrl(URL.createObjectURL(file));
    setError(null);
  };

  const ensureEngine = async () => {
    if (!audioRef.current) throw new Error("Audio player is not ready");
    if (!engineRef.current) engineRef.current = createEqEngine(audioRef.current);
    if (engineRef.current.context.state === "suspended") await engineRef.current.context.resume();
    return engineRef.current;
  };

  const play = async () => {
    try { await ensureEngine(); await audioRef.current?.play(); setError(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not start audio playback."); }
  };

  return (
    <section aria-label="AGN Media Deck" className="agn-media-deck">
      <h2>Media Deck</h2>
      <label>My Files — MP3/WAV <input type="file" accept="audio/mpeg,audio/wav,.mp3,.wav" onChange={selectFile} /></label>
      {fileUrl && <audio ref={audioRef} src={fileUrl} controls preload="metadata" />}
      <div className="agn-media-deck__controls">
        <button type="button" disabled={!fileUrl} onClick={() => void play()}>Play through EQ</button>
        <label>Output boost {boostPercent}% <input type="range" min="0" max="200" value={boostPercent} onChange={(event) => {
          const value = Number(event.target.value); setBoostPercent(value); engineRef.current?.setBoost(value / 100);
        }} /></label>
        <button type="button" onClick={() => { const next = !muted; setMuted(next); engineRef.current?.setMuted(next); }}>{muted ? "Unmute" : "Mute"}</button>
      </div>
      <div className="agn-media-deck__bands" aria-label="10-band equalizer">
        {EQ_FREQUENCIES.map((frequency, index) => <fieldset key={frequency}>
          <legend>{frequency >= 1000 ? `${frequency / 1000} kHz` : `${frequency} Hz`}</legend>
          <input aria-label={`${frequency} Hz gain`} type="range" min="-18" max="18" step="0.5" value={gains[index]} onChange={(event) => {
            const gain = Number(event.target.value); setGains((previous) => previous.map((value, i) => i === index ? gain : value));
            engineRef.current?.setBand(index, { gain });
          }} />
          <label><input type="checkbox" checked={enabled[index]} onChange={(event) => {
            const on = event.target.checked; setEnabled((previous) => previous.map((value, i) => i === index ? on : value));
            engineRef.current?.setBand(index, { enabled: on });
          }} /> On</label>
          <button type="button" aria-pressed={solo === index} onClick={() => {
            const next = solo === index ? null : index; setSolo(next); engineRef.current?.setSolo(next);
          }}>Solo</button>
        </fieldset>)}
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
