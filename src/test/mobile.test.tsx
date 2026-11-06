import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

const originalWidth = window.innerWidth;
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  Object.defineProperty(window, "innerWidth", { configurable: true, value: originalWidth });
});

describe("shared 900px mobile boundary", () => {
  it.each([
    [899, true],
    [900, false],
    [1280, false],
  ] as const)("at %ipx mobile is %s", (width, expected) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    const matchMedia = vi
      .fn()
      .mockReturnValue({ addEventListener: vi.fn(), removeEventListener: vi.fn() });
    vi.stubGlobal("matchMedia", matchMedia);
    const { result } = renderHook(() => useIsMobile());
    expect(matchMedia).toHaveBeenCalledWith("(max-width: 899px)");
    expect(result.current).toBe(expected);
  });
});
