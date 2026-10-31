import { describe, expect, it } from "vitest";
import { scheduleCatalog, validTimezone } from "@/lib/schedule-helper";

const now = Date.parse("2026-10-20T06:22:00Z");
describe("schedule helper published times", () => {
  it("shows Asia's November 23 12:00 UTC start at 21:00 Tokyo time", () => {
    expect(scheduleCatalog(now, "Asia/Tokyo").find((event) => event.id === "ASIA_LAUNCH")?.localStart).toBe("Mon, 23 Nov 2026, 21:00 GMT+9");
  });
  it("shows the confirmed Europe 20:00 UTC start in New York", () => {
    expect(scheduleCatalog(now, "America/New_York").find((event) => event.id === "EU_LAUNCH")?.localStart).toBe("Mon, 23 Nov 2026, 15:00 GMT-5");
  });
  it("preserves the Americas prior-day 21:00 EST date", () => {
    expect(scheduleCatalog(now, "America/New_York").find((event) => event.id === "AMERICAS_LAUNCH")?.localStart).toBe("Mon, 23 Nov 2026, 21:00 GMT-5");
  });
  it("keeps October 21 midnight UTC separate from tournament launch", () => {
    expect(scheduleCatalog(now, "America/New_York").find((event) => event.id === "SITE")?.localStart).toBe("Tue, 20 Oct 2026, 20:00 GMT-4");
  });
  it("derives three-hour daily segments after the launch", () => {
    const event = scheduleCatalog(Date.parse("2026-11-24T23:00:00Z"), "UTC").find((entry) => entry.id === "EU_NEXT");
    expect(event?.utcStart).toBe("2026-11-25T20:00:00.000Z");
    expect((event?.end ?? 0) - (event?.start ?? 0)).toBe(10_800_000);
  });
  it("gives COD Solos its November 27 start with a 15-minute check-in", () => {
    const solos = scheduleCatalog(now, "America/New_York").find((e) => e.id === "SOLOS_AMERICAS_LAUNCH");
    expect(solos?.localStart).toBe("Fri, 27 Nov 2026, 21:00 GMT-5");
    expect(solos?.localCheckIn).toBe("Fri, 27 Nov 2026, 20:45 GMT-5");
  });
  it("rejects invalid visitor timezones", () => {
    expect(validTimezone("Not/A_Timezone")).toBe(false);
    expect(validTimezone("America/New_York")).toBe(true);
  });
});