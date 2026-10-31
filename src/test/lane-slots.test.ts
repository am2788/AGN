import { describe, expect, it } from "vitest";
import { filledSlots, laneSlotCapacity } from "@/lib/arena";

describe("lane bracket slots", () => {
  it("6v6 lanes have 1,024 slots", () => { expect(laneSlotCapacity(0)).toBe(1024); expect(laneSlotCapacity(4)).toBe(1024); });
  it("Zombies squads have 1,536 slots", () => expect(laneSlotCapacity(3)).toBe(1536));
  it("solo lanes have 6,144 slots", () => { expect(laneSlotCapacity(1)).toBe(6144); expect(laneSlotCapacity(2)).toBe(6144); expect(laneSlotCapacity(5)).toBe(6144); });
  it("incomplete teams do not fill a slot", () => expect(filledSlots(4099, 3)).toBe(1024));
});
