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

/** Build the local-file Web Audio graph. Call only once per media element. */
export function createEqEngine(
  media: HTMLMediaElement,
  context: AudioContext = new AudioContext(),
): EqEngine {
  const source = context.createMediaElementSource(media);
  const lowCut = context.createBiquadFilter();
  lowCut.type = "highpass";
  lowCut.frequency.value = 20;

  const bands = EQ_FREQUENCIES.map((frequency, index) => {
    const filter = context.createBiquadFilter();
    filter.type = index === 0 ? "lowshelf" : index === EQ_FREQUENCIES.length - 1 ? "highshelf" : "peaking";
    filter.frequency.value = frequency;
    filter.Q.value = 1;
    filter.gain.value = 0;
    return filter;
  });

  const highCut = context.createBiquadFilter();
  highCut.type = "lowpass";
  highCut.frequency.value = 20000;
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
  for (const band of bands) {
    previous.connect(band);
    previous = band;
  }
  previous.connect(highCut);
  highCut.connect(boost).connect(mute).connect(limiter).connect(analyser).connect(context.destination);

  let soloIndex: number | null = null;
  const updateBandAudibility = () => bands.forEach((band, index) => {
    band.gain.value = index === soloIndex || soloIndex === null ? band.gain.value : 0;
    band.disconnect();
    if (index === soloIndex) {
      // A solo path runs in parallel from the low-cut stage through the selected band.
      lowCut.connect(band);
      band.connect(highCut);
    } else if (soloIndex === null) {
      const input = index === 0 ? lowCut : bands[index - 1];
      input.connect(band);
      band.connect(index === bands.length - 1 ? highCut : bands[index + 1]);
    }
  });

  return {
    context, source, lowCut, bands, highCut, boost, mute, limiter, analyser,
    setBand(index, setting) {
      const band = bands[index];
      if (!band) return;
      if (setting.gain !== undefined) band.gain.value = clampEqGain(setting.gain);
      if (setting.q !== undefined) band.Q.value = Math.max(0.1, Math.min(18, setting.q));
      if (setting.enabled !== undefined && !setting.enabled) band.gain.value = 0;
    },
    setBoost(value) { boost.gain.value = clampOutputBoost(value); },
    setMuted(value) { mute.gain.value = value ? 0 : 1; },
    setSolo(index) {
      soloIndex = index !== null && bands[index] ? index : null;
      updateBandAudibility();
    },
    dispose() {
      source.disconnect();
      lowCut.disconnect();
      bands.forEach((band) => band.disconnect());
      highCut.disconnect(); boost.disconnect(); mute.disconnect(); limiter.disconnect(); analyser.disconnect();
      void context.close();
    },
  };
}
