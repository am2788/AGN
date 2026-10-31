import { describe, expect, it } from "vitest";
import { capacityPercent, REGISTRATION_STATUSES } from "@/lib/registration-control";
describe("registration control", () => {
  it("has exactly open, paused, closed", () => expect([...REGISTRATION_STATUSES]).toEqual(["OPEN", "PAUSED", "CLOSED"]));
  it("half of 6,144 is 50%", () => expect(capacityPercent(3072, 6144)).toBe(50));
  it("never exceeds 100%", () => expect(capacityPercent(7000, 6144)).toBe(100));
});
