export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;
export const MIN_GAIN_DB = -18;
export const MAX_GAIN_DB = 18;
export const MAX_OUTPUT_BOOST = 2;
export type EqBandSetting = { gain: number; q: number; enabled: boolean };
export function clampEqGain(value: number) {
  return Math.min(18, Math.max(-18, Number.isFinite(value) ? value : 0));
}
export function clampOutputBoost(value: number) {
  return Math.min(2, Math.max(0, Number.isFinite(value) ? value : 1));
}
export type EqEngine = ReturnType<typeof createEqEngine>;

/** Create once per element, only after user interaction. No parallel paths bypass the compressor. */
export function createEqEngine(
  media: HTMLMediaElement,
  context: AudioContext = new AudioContext(),
) {
  const source = context.createMediaElementSource(media);
  const lowCut = context.createBiquadFilter();
  lowCut.type = "highpass";
  lowCut.frequency.value = 20;
  const settings: EqBandSetting[] = EQ_FREQUENCIES.map(() => ({ gain: 0, q: 1, enabled: true }));
  const bands = EQ_FREQUENCIES.map((frequency) => {
    const node = context.createBiquadFilter();
    node.type = "peaking";
    node.frequency.value = Math.min(frequency, context.sampleRate / 2 - 1);
    node.Q.value = 1;
    node.gain.value = 0;
    return node;
  });
  const highCut = context.createBiquadFilter();
  highCut.type = "lowpass";
  highCut.frequency.value = Math.min(20000, context.sampleRate / 2 - 1);
  const boost = context.createGain();
  boost.gain.value = 1;
  const mute = context.createGain();
  mute.gain.value = 1;
  const limiter = context.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.1;
  const analyser = context.createAnalyser();
  analyser.fftSize = 64;
  const chain: AudioNode[] = [
    source,
    lowCut,
    ...bands,
    highCut,
    boost,
    mute,
    limiter,
    analyser,
    context.destination,
  ];
  chain.slice(0, -1).forEach((node, i) => node.connect(chain[i + 1]!));
  let solo: number | null = null;
  let disposed = false;
  const smooth = (param: AudioParam, value: number) =>
    param.setTargetAtTime(value, context.currentTime, 0.015);
  const update = () =>
    bands.forEach((node, i) => {
      const setting = settings[i]!;
      smooth(node.gain, setting.enabled && (solo === null || solo === i) ? setting.gain : 0);
      smooth(node.Q, setting.q);
    });
  return {
    context,
    source,
    lowCut,
    bands,
    highCut,
    boost,
    mute,
    limiter,
    analyser,
    setBand(index: number, patch: Partial<EqBandSetting>) {
      const setting = settings[index];
      if (!setting) return;
      if (patch.gain !== undefined) setting.gain = clampEqGain(patch.gain);
      if (patch.q !== undefined && Number.isFinite(patch.q))
        setting.q = Math.max(0.1, Math.min(18, patch.q));
      if (patch.enabled !== undefined) setting.enabled = patch.enabled;
      update();
    },
    setBoost(value: number) {
      smooth(boost.gain, clampOutputBoost(value));
    },
    setMuted(value: boolean) {
      smooth(mute.gain, value ? 0 : 1);
    },
    setSolo(index: number | null) {
      solo = index !== null && settings[index] ? index : null;
      update();
    },
    setCuts(low: number, high: number) {
      if (!Number.isFinite(low) || !Number.isFinite(high)) return;
      smooth(lowCut.frequency, Math.max(20, Math.min(1000, low)));
      smooth(
        highCut.frequency,
        Math.min(context.sampleRate / 2 - 1, Math.max(2000, Math.min(20000, high))),
      );
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      chain.slice(0, -1).forEach((node) => node.disconnect());
      void context.close();
    },
  };
}
