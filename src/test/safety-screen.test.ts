import { describe, expect, it } from "vitest";
import { quickScreen } from "@/lib/safety-screen";

describe("message safety pre-screen", () => {
  it("blocks secrecy luring as high-severity grooming", () => {
    const r = quickScreen("don't tell your parents we talk");
    expect(r).toMatchObject({ verdict: "block", category: "grooming", severity: "high" });
  });
  it("blocks photo requests as grooming", () => {
    expect(quickScreen("send me a pic").category).toBe("grooming");
  });
  it("blocks explicit content", () => {
    expect(quickScreen("check my onlyfans").category).toBe("explicit");
  });
  it("allows normal gaming trash talk", () => {
    expect(quickScreen("gg you got destroyed in lane 3").verdict).toBe("allow");
  });
});
