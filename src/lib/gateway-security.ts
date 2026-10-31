import { z } from "zod";

export const SECURITY_TIERS = ["Rookie", "Warrior", "Champion", "Elite", "Legend", "Mythic"] as const;
export const idPreviewSchema = z.object({
  type: z.enum(["image/jpeg", "image/png", "image/webp"], { message: "Choose a JPG, PNG or WebP image." }),
  size: z.number().int().positive().max(5 * 1024 * 1024, "Choose an image smaller than 5 MB."),
});
export function canOpenIdScanner(adult: boolean, terms: boolean) { return adult && terms; }
/** Preview choices never produce authoritative identity/checkout state. */
export function securityPreviewAccess() { return { identityVerified: false, checkoutEnabled: false } as const; }