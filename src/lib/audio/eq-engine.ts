export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;
export const MIN_GAIN_DB = -18;
export const MAX_GAIN_DB = 18;
export const MAX_OUTPUT_BOOST = 2;
export type EqBandSetting = { gain: number; q: number; enabled: boolean };
export type EqEngine = {
  context: AudioContext;
  source: MediaElementAudioSourceNode;
  lowCut: BiquadFilterNode;
  bands: BiquadFilterNode[];
  highCut: BiquadFilterNode;
  boost: GainNode;
  mute: GainNode;
  limiter: DynamicsCompressorNode;
  analyser: AnalyserNode;
  setBand: (index: number, setting: Partial<EqBandSetting>) => void;
  setLowCut: (frequency: number) => void;
  setHighCut: (frequency: number) => void;
  setBoost: (value: number) => void;
  setMuted: (muted: boolean) => void;
  setSolo: (index: number | null) => void;
  dispose: () => void;
};
export function clampEqGain(value: number): number {
  return Math.min(MAX_GAIN_DB, Math.max(MIN_GAIN_DB, Number.isFinite(value) ? value : 0));
}
export function clampOutputBoost(value: number): number {
  return Math.min(MAX_OUTPUT_BOOST, Math.max(0, Number.isFinite(value) ? value : 1));
}
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

/** One MediaElementAudioSource per media element; build after user gesture where required. */
export function createEqEngine(media: HTMLMediaElement, context: AudioContext = new AudioContext()): EqEngine {
  const source = context.createMediaElementSource(media);
  const lowCut = context.createBiquadFilter();
  lowCut.type = "highpass";
  lowCut.frequency.value = 20;
  const bands = EQ_FREQUENCIES.map((frequency, index) => {
    const node = context.createBiquadFilter();
    node.type = index === 0 ? "lowshelf" : index === EQ_FREQUENCIES.length - 1 ? "highshelf" : "peaking";
    node.frequency.value = Math.min(frequency, context.sampleRate / 2);
    node.Q.value = 1;
    node.gain.value = 0;
    return node;
  });
  const highCut = context.createBiquadFilter();
  highCut.type = "lowpass";
  highCut.frequency.value = Math.min(20000, context.sampleRate / 2);
  const boost = context.createGain();
  boost.gain.value = 1;
  const mute = context.createGain();
  mute.gain.value = 1;
  const limiter = context.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.1;
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;

  source.connect(lowCut);
  let previous: AudioNode = lowCut;
  for (const band of bands) { previous.connect(band); previous = band; }
  previous.connect(highCut);
  highCut.connect(boost).connect(mute).connect(limiter).connect(analyser).connect(context.destination);

  let soloIndex: number | null = null;
  const settings: EqBandSetting[] = bands.map(() => ({ gain: 0, q: 1, enabled: true }));
  const connectNormal = () => {
    lowCut.disconnect();
    bands.forEach((band) => band.disconnect());
    lowCut.connect(bands[0]);
    for (let i = 0; i < bands.length - 1; i++) bands[i].connect(bands[i + 1]);
    bands[bands.length - 1].connect(highCut);
    bands.forEach((band, index) => { band.gain.value = settings[index].enabled ? settings[index].gain : 0; });
  };
  const connectSolo = (index: number) => {
    lowCut.disconnect();
    bands.forEach((band) => band.disconnect());
    lowCut.connect(bands[index]);
    bands[index].connect(highCut);
    bands.forEach((band, i) => { band.gain.value = i === index && settings[i].enabled ? settings[i].gain : 0; });
  };

  return {
    context, source, lowCut, bands, highCut, boost, mute, limiter, analyser,
    setBand(index, setting) {
      if (!bands[index]) return;
      const current = settings[index];
      if (setting.gain !== undefined) current.gain = clampEqGain(setting.gain);
      if (setting.q !== undefined) current.q = clamp(setting.q, 0.1, 18);
      if (setting.enabled !== undefined) current.enabled = setting.enabled;
      bands[index].Q.value = current.q;
      if (soloIndex === null) bands[index].gain.value = current.enabled ? current.gain : 0;
      else connectSolo(soloIndex);
    },
    setLowCut(frequency) { lowCut.frequency.value = clamp(frequency, 20, 500); },
    setHighCut(frequency) { highCut.frequency.value = clamp(frequency, 1000, Math.min(20000, context.sampleRate / 2)); },
    setBoost(value) { boost.gain.value = clampOutputBoost(value); },
    setMuted(value) { mute.gain.value = value ? 0 : 1; },
    setSolo(index) {
      soloIndex = index !== null && bands[index] ? index : null;
      if (soloIndex === null) connectNormal(); else connectSolo(soloIndex);
    },
    dispose() {
      source.disconnect(); lowCut.disconnect(); bands.forEach((band) => band.disconnect());
      highCut.disconnect(); boost.disconnect(); mute.disconnect(); limiter.disconnect(); analyser.disconnect();
      void context.close();
    },
  };
}
