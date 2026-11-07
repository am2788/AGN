import { createElement, useEffect, useRef, useState, type ChangeEvent } from "react";
import { createEqEngine, EQ_FREQUENCIES, type EqEngine } from "../../lib/audio/eq-engine";

const h = createElement;

type BandState = { gain: number; enabled: boolean };
const initialBands = (): BandState[] => EQ_FREQUENCIES.map(() => ({ gain: 0, enabled: true }));

/** Local-file parametric EQ UI. Call play from a user gesture to satisfy browser audio policies. */
export function ParametricEQ() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const engineRef = useRef<EqEngine | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [bands, setBands] = useState<BandState[]>(initialBands);
  const [lowCut, setLowCut] = useState(20);
  const [highCut, setHighCut] = useState(20000);
  const [boostPercent, setBoostPercent] = useState(100);
  const [muted, setMuted] = useState(false);
  const [soloBand, setSoloBand] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    engineRef.current?.dispose();
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!(/\.(mp3|wav)$/i.test(file.name) || ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/wave"].includes(file.type))) {
      setError("Select an MP3 or WAV audio file.");
      event.currentTarget.value = "";
      return;
    }
    engineRef.current?.dispose();
    engineRef.current = null;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setFileName(file.name);
    setFileUrl(nextUrl);
    setError(null);
  };

  const ensureEngine = async () => {
    if (!audioRef.current) throw new Error("Audio player is not available");
    if (!engineRef.current) {
      const engine = createEqEngine(audioRef.current);
      engine.setLowCut(lowCut);
      engine.setHighCut(highCut);
      engine.setBoost(boostPercent / 100);
      engine.setMuted(muted);
      bands.forEach((band, index) => engine.setBand(index, { gain: band.gain, enabled: band.enabled }));
      engine.setSolo(soloBand);
      engineRef.current = engine;
    }
    if (engineRef.current.context.state === "suspended") await engineRef.current.context.resume();
    return engineRef.current;
  };

  const play = async () => {
    try {
      const engine = await ensureEngine();
      await audioRef.current?.play();
      setError(null);
      return engine;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to play this file through the EQ.");
      return null;
    }
  };

  const updateBand = (index: number, patch: Partial<BandState>) => {
    setBands((current) => current.map((band, i) => i === index ? { ...band, ...patch } : band));
    engineRef.current?.setBand(index, patch);
  };

  const updateLowCut = (value: number) => {
    setLowCut(value);
    engineRef.current?.setLowCut(value);
  };
  const updateHighCut = (value: number) => {
    setHighCut(value);
    engineRef.current?.setHighCut(value);
  };
  const updateBoost = (value: number) => {
    setBoostPercent(value);
    engineRef.current?.setBoost(value / 100);
  };

  return h("section", { className: "agn-parametric-eq", "aria-label": "Parametric EQ Media Deck" },
    h("h2", null, "Parametric EQ"),
    h("label", null, "Local MP3/WAV ", h("input", { type: "file", accept: ".mp3,.wav,audio/mpeg,audio/wav", onChange: onFile })),
    fileUrl && h("div", { className: "agn-parametric-eq__player" },
      h("p", null, fileName),
      h("audio", { ref: audioRef, src: fileUrl, controls: true, preload: "metadata" }),
      h("button", { type: "button", onClick: () => void play() }, "Play through EQ"),
    ),
    h("div", { className: "agn-parametric-eq__filters" },
      h("label", null, `Low cut: ${lowCut} Hz`, h("input", { type: "range", min: 20, max: 500, step: 1, value: lowCut, onChange: (event) => updateLowCut(Number(event.currentTarget.value)) })),
      h("label", null, `High cut: ${highCut} Hz`, h("input", { type: "range", min: 1000, max: 20000, step: 10, value: highCut, onChange: (event) => updateHighCut(Number(event.currentTarget.value)) })),
      h("label", null, `Output: ${boostPercent}%`, h("input", { type: "range", min: 0, max: 200, step: 1, value: boostPercent, onChange: (event) => updateBoost(Number(event.currentTarget.value)) })),
      h("button", { type: "button", onClick: () => { const next = !muted; setMuted(next); engineRef.current?.setMuted(next); } }, muted ? "Unmute" : "Mute"),
    ),
    h("div", { className: "agn-parametric-eq__bands", role: "group", "aria-label": "10 frequency bands" },
      ...EQ_FREQUENCIES.map((frequency, index) => h("fieldset", { key: frequency },
        h("legend", null, frequency >= 1000 ? `${frequency / 1000} kHz` : `${frequency} Hz`),
        h("label", null, `Gain ${bands[index].gain} dB`, h("input", {
          type: "range", min: -18, max: 18, step: 0.5, value: bands[index].gain,
          onChange: (event) => updateBand(index, { gain: Number(event.currentTarget.value) }),
        })),
        h("label", null, h("input", {
          type: "checkbox", checked: bands[index].enabled,
          onChange: (event) => updateBand(index, { enabled: event.currentTarget.checked }),
        }), "Enabled"),
        h("button", { type: "button", "aria-pressed": soloBand === index, onClick: () => {
          const next = soloBand === index ? null : index;
          setSoloBand(next);
          engineRef.current?.setSolo(next);
        } }, soloBand === index ? "Unsolo" : "Solo"),
      )),
    ),
    h("p", { className: "agn-parametric-eq__limiter-note" }, "Output boost is capped at 200% and passes through a dynamics compressor. Start at a low listening level; compression is not a guaranteed brick-wall limiter."),
    error && h("p", { role: "alert" }, error),
  );
}

export default ParametricEQ;
