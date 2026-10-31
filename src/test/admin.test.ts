import { describe, expect, it } from "vitest";
import { hasAdminAccess } from "@/lib/admin";
describe("private admin access", () => {
  it("admits only a verified true role result", () => { expect(hasAdminAccess(true)).toBe(true); });
  it("denies players, missing roles and forged role text", () => {
    for (const value of [false, null, undefined, "admin", "true", { role: "admin" }]) expect(hasAdminAccess(value)).toBe(false);
  });
});