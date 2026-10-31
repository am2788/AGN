import { describe, expect, it } from "vitest";
import { canOpenIdScanner, idPreviewSchema, securityPreviewAccess } from "@/lib/gateway-security";

describe("security preview gates", () => {
  it("requires the 18+ acknowledgement before the scanner opens", () => { expect(canOpenIdScanner(false, true)).toBe(false); });
  it("requires Terms and Privacy acknowledgement before the scanner opens", () => { expect(canOpenIdScanner(true, false)).toBe(false); });
  it("opens only the preview once both acknowledgements are provided", () => { expect(canOpenIdScanner(true, true)).toBe(true); });
  it("never confers verified identity or checkout access", () => { expect(securityPreviewAccess()).toEqual({ identityVerified: false, checkoutEnabled: false }); });
  it("rejects non-image uploads", () => { expect(idPreviewSchema.safeParse({ type: "application/pdf", size: 100 }).success).toBe(false); });
  it("limits local images to 5 MB", () => { expect(idPreviewSchema.safeParse({ type: "image/png", size: 5242881 }).success).toBe(false); expect(idPreviewSchema.safeParse({ type: "image/png", size: 5242880 }).success).toBe(true); });
});