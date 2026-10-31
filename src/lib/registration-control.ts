export const REGISTRATION_STATUSES = ["OPEN", "PAUSED", "CLOSED"] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

/** Share of a lane's capacity filled, clamped to 0–100. */
export function capacityPercent(entries: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.max(0, (entries / capacity) * 100));
}

export const REGISTRATION_CLOSED_MESSAGE = "Tournament registration is not open right now. Please check back soon.";
