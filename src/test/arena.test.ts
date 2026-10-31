import { describe, expect, it } from "vitest";
import { ARENA_LANES, DAILY_EPISODES_AT_CAPACITY, LANES_SCHEDULE, REGIONAL_SCHEDULE, REGIONAL_SEGMENT_HOURS, laneRegionalSchedule, regionalSegment, MASTER_DEADLINE, countdownSeconds, formatCountdown, formatLaneCountdown } from "@/lib/arena";

describe("arena lanes", () => {
  it("provides exactly six distinct competitive lanes", () => {
    expect(ARENA_LANES).toHaveLength(6);
    expect(new Set(ARENA_LANES).size).toBe(6);
  });
});

describe("supplied regional schedule", () => {
  it("runs three episodes per day at full capacity", () => {
    expect(DAILY_EPISODES_AT_CAPACITY).toBe(3);
  });
  it("adds Tokyo Teams at 12:00 UTC, equivalent to 21:00 JST", () => {
    const tokyo = LANES_SCHEDULE.find((event) => event.id === "lane-1-asia");
    expect(tokyo).toMatchObject({ lane: 1, region: "ASIA", startTime: "2026-11-23T12:00:00Z", status: "UPCOMING" });
    expect(countdownSeconds(Date.parse(tokyo?.startTime ?? ""), Date.parse("2026-11-23T11:00:00Z"))).toBe(3600);
    expect(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(tokyo?.startTime ?? ""))).toBe("21:00");
  });
  it("gives Teams and Zombies the November 23 regional starts", () => {
    expect(LANES_SCHEDULE).toHaveLength(18);
    expect([...new Set(LANES_SCHEDULE.map((event) => event.lane))]).toEqual([1, 2, 3, 4, 5, 6]);
    for (const lane of ARENA_LANES.filter((l) => [1, 3, 4].includes(l))) {
      expect(LANES_SCHEDULE.filter((event) => event.lane === lane).map(({ region, startTime }) => ({ region, startTime }))).toEqual([
        { region: "ASIA", startTime: "2026-11-23T12:00:00Z" },
        { region: "EU", startTime: "2026-11-23T20:00:00Z" },
        { region: "AMERICAS", startTime: "2026-11-24T02:00:00Z" },
      ]);
    }
  });
  it("moves COD Solos to November 27 at the same regional times", () => {
    expect(LANES_SCHEDULE.filter((e) => e.lane === 2).map((e) => e.startTime)).toEqual([
      "2026-11-27T12:00:00Z", "2026-11-27T20:00:00Z", "2026-11-28T02:00:00Z",
    ]);
  });
  it("rolls out SF6 on Tuesday Nov 24 and Fortnite on Wednesday Nov 25", () => {
    expect(LANES_SCHEDULE.find((e) => e.id === "lane-6-asia")?.startTime).toBe("2026-11-24T12:00:00Z");
    expect(LANES_SCHEDULE.find((e) => e.id === "lane-5-asia")?.startTime).toBe("2026-11-25T12:00:00Z");
    expect(LANES_SCHEDULE.filter((e) => e.lane === 6).map((e) => e.startTime)).toEqual([
      "2026-11-24T12:00:00Z", "2026-11-24T20:00:00Z", "2026-11-25T02:00:00Z",
    ]);
    expect(LANES_SCHEDULE.filter((e) => e.lane === 5).map((e) => e.startTime)).toEqual([
      "2026-11-25T12:00:00Z", "2026-11-25T20:00:00Z", "2026-11-26T02:00:00Z",
    ]);
  });
  it("opens air time 15 minutes before each start", () => {
    expect(laneRegionalSchedule(2).map((s) => s.preludeUtc)).toEqual(["11:45 UTC", "19:45 UTC", "01:45 UTC"]);
  });
  it("anchors Americas to November 23 at 21:00 EST", () => {
    const americas = REGIONAL_SCHEDULE.find((event) => event.region === "AMERICAS");
    const date = new Date(americas?.startTime ?? "");
    expect(new Intl.DateTimeFormat("en-GB", { timeZone: "America/New_York", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(date)).toBe("23/11/2026, 21:00");
  });
  it("uses three-hour windows", () => {
    expect(REGIONAL_SEGMENT_HOURS).toBe(3);
    expect(regionalSegment("2026-11-23T20:00:00Z", Date.parse("2026-11-23T20:00:00Z"))).toMatchObject({ inWindow: true, target: Date.parse("2026-11-23T23:00:00Z") });
  });
  it("counts down before the first launch", () => {
    const segment = regionalSegment("2026-11-23T20:00:00Z", Date.parse("2026-11-23T19:00:00Z"));
    expect(segment.inWindow).toBe(false);
    expect(countdownSeconds(segment.target, Date.parse("2026-11-23T19:00:00Z"))).toBe(3600);
  });
  it("repeats daily at the same UTC time once the segment ends", () => {
    expect(regionalSegment("2026-11-23T20:00:00Z", Date.parse("2026-11-23T23:00:00Z"))).toMatchObject({ inWindow: false, nextStart: Date.parse("2026-11-24T20:00:00Z"), target: Date.parse("2026-11-24T20:00:00Z") });
    expect(regionalSegment("2026-11-23T20:00:00Z", Date.parse("2026-11-25T21:00:00Z"))).toMatchObject({ inWindow: true, target: Date.parse("2026-11-25T23:00:00Z") });
  });
  it("formats multi-day countdowns", () => {
    expect(formatLaneCountdown(90061)).toBe("1d 01:01:01");
  });
});

describe("countdown", () => {
  it("targets Wednesday October 21, 2026, defaulting to midnight UTC", () => {
    expect(new Date(MASTER_DEADLINE).toISOString()).toBe("2026-10-21T00:00:00.000Z");
    expect(new Date(MASTER_DEADLINE).getUTCDay()).toBe(3);
    expect(countdownSeconds(MASTER_DEADLINE, Date.parse("2026-10-20T00:00:00Z"))).toBe(86400);
  });
  it("counts down to the supplied deadline without becoming negative", () => {
    expect(countdownSeconds(10_000, 8_500)).toBe(2);
    expect(countdownSeconds(10_000, 11_000)).toBe(0);
  });
  it("formats hours, minutes, and seconds", () => {
    expect(formatCountdown(3661)).toBe("01:01:01");
  });
});
import { WAGER_STEPS, WAGER_TIERS, WAGERING_RULES, wagerSplit } from "@/lib/arena";
describe("wager tiers", () => {
  it("fees are 5/25/100/250 USD", () => {
    expect(WAGER_TIERS.map((t) => t.feeCents)).toEqual([500, 2500, 10000, 25000]);
  });
  it("recruit $5: prize $8, vault $2", () => {
    expect(wagerSplit(500)).toEqual({ prizeCents: 800, vaultCents: 200 });
  });
  it("elite $250: prize $400, vault $100", () => {
    expect(wagerSplit(25000)).toEqual({ prizeCents: 40000, vaultCents: 10000 });
  });
});

describe("wager section copy", () => {
  it("shows exactly three ordered steps", () => {
    expect(WAGER_STEPS.map((step) => step.id)).toEqual([1, 2, 3]);
    expect(WAGER_STEPS.map((step) => step.title)).toEqual([
      "Select active matchup",
      "Choose tier",
      "Confirm 18+ ID verification status",
    ]);
  });
  it("names every tier and fee in step two", () => {
    expect(WAGER_STEPS[1].instruction).toContain("Recruit $5");
    expect(WAGER_STEPS[1].instruction).toContain("Contender $25");
    expect(WAGER_STEPS[1].instruction).toContain("Veteran $100");
    expect(WAGER_STEPS[1].instruction).toContain("Elite $250");
  });
  it("states that results are reviewed and verified before payout is settled", () => {
    expect(WAGERING_RULES).toContain(
      "All match results are reviewed and verified before payout is settled.",
    );
  });
});
