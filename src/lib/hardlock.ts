// Final Hardlock confirmation preview. Payments are not connected, so a real
// hardlock can never occur here — this module stays fail-closed.
export const HARDLOCK_HEADLINE = "REGISTRATION HARDLOCKED // PRESTIGE TOKEN INITIALIZED";

export function hardlockPreviewState() {
  return { paymentConfirmed: false, registrationLocked: false, tokenIssued: false } as const;
}
