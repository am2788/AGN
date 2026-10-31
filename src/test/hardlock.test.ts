import { describe, expect, it } from "vitest";
import { HARDLOCK_HEADLINE, hardlockPreviewState } from "@/lib/hardlock";

describe("final hardlock preview", () => {
  it("carries the exact confirmation headline", () => {
    expect(HARDLOCK_HEADLINE).toBe("REGISTRATION HARDLOCKED // PRESTIGE TOKEN INITIALIZED");
  });
  it("never reports a confirmed payment", () => {
    expect(hardlockPreviewState().paymentConfirmed).toBe(false);
  });
  it("never locks a registration from the preview", () => {
    expect(hardlockPreviewState().registrationLocked).toBe(false);
  });
  it("never issues a prestige token from the preview", () => {
    expect(hardlockPreviewState().tokenIssued).toBe(false);
  });
});
