import { describe, expect, it, vi } from "vitest";
import {
  createEqEngine,
  clampEqGain,
  clampOutputBoost,
  EQ_FREQUENCIES,
} from "@/lib/audio/eq-engine";

function fakeContext() {
  const nodes: Record<string, unknown>[] = [];
  const param = () => ({ value: 0, setTargetAtTime: vi.fn() });
  const node = () => {
    const item = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      frequency: param(),
      Q: param(),
      gain: param(),
      threshold: param(),
      knee: param(),
      ratio: param(),
      attack: param(),
      release: param(),
      fftSize: 0,
      type: "",
    };
    nodes.push(item);
    return item;
  };
  const context = {
    sampleRate: 48000,
    currentTime: 0,
    createMediaElementSource: vi.fn(node),
    createBiquadFilter: vi.fn(node),
    createGain: vi.fn(node),
    createDynamicsCompressor: vi.fn(node),
    createAnalyser: vi.fn(node),
    destination: node(),
    close: vi.fn().mockResolvedValue(undefined),
  };
  return { context, nodes };
}
describe("parametric EQ safety graph", () => {
  it("uses ten peaking filters and a single series path through the limiter", () => {
    const { context } = fakeContext();
    const engine = createEqEngine({} as HTMLMediaElement, context as unknown as AudioContext);
    expect(engine.bands).toHaveLength(10);
    engine.bands.forEach((band, i) => {
      expect(band.type).toBe("peaking");
      expect(band.frequency.value).toBe(EQ_FREQUENCIES[i]);
    });
    expect(engine.boost.connect).toHaveBeenCalledWith(engine.mute);
    expect(engine.mute.connect).toHaveBeenCalledWith(engine.limiter);
    expect(engine.limiter.connect).toHaveBeenCalledWith(engine.analyser);
    expect(engine.analyser.connect).toHaveBeenCalledWith(context.destination);
    engine.setBoost(999);
    expect(engine.boost.gain.setTargetAtTime).toHaveBeenCalledWith(2, 0, 0.015);
    engine.setBand(2, { gain: 8, q: 2 });
    engine.setSolo(3);
    engine.setSolo(null);
    expect(engine.bands[2]!.gain.setTargetAtTime).toHaveBeenLastCalledWith(8, 0, 0.015);
    expect(engine.bands[2]!.disconnect).not.toHaveBeenCalled();
    engine.dispose();
    engine.dispose();
    expect(context.close).toHaveBeenCalledTimes(1);
  });
  it("rejects non-finite gain and output values safely", () => {
    expect(clampEqGain(NaN)).toBe(0);
    expect(clampEqGain(Infinity)).toBe(0);
    expect(clampOutputBoost(3)).toBe(2);
    expect(clampOutputBoost(-1)).toBe(0);
    expect(clampOutputBoost(NaN)).toBe(1);
  });
});
