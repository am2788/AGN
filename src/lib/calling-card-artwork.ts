import futuristic from "@/assets/calling-cards/pink_and_purp_futuristic.jpg.asset.json";
import gold from "@/assets/calling-cards/black_with_gold_lining.jpg.asset.json";
import glitch from "@/assets/calling-cards/data_glitch.jpg.asset.json";
import darkMatter from "@/assets/calling-cards/dark_matter_oil_slick.jpg.asset.json";
import autumn from "@/assets/calling-cards/autum.jpg.asset.json";
import retro from "@/assets/calling-cards/retro_cyber.jpg.asset.json";
import aether from "@/assets/calling-cards/aether.jpg.asset.json";
import eu from "@/assets/calling-cards/EU.jpg.asset.json";
import winter from "@/assets/calling-cards/winter.jpg.asset.json";
import rebelGoldFlag from "@/assets/calling-cards/rebel_gold_flag.jpg.asset.json";
import neonGlitchUnionJack from "@/assets/calling-cards/neon_glitch_union_jack.jpg.asset.json";
import hazardCircuit from "@/assets/calling-cards/hazard_circuit.jpg.asset.json";

// Public presentation art only; artwork never determines rank or account access.
//
// Tiers:
// - "standard": entry-level choices every signed-in participant may equip.
// - "premium-static" / "premium-motion": require a verified entitlement.
//   No payment-verified entitlement source exists yet, so premium cards
//   stay locked (fail-closed) and none are listed until real artwork and
//   verification arrive. The 100-card catalog target is expansion only;
//   missing artwork is never invented.
export type CardTier = "standard" | "premium-static" | "premium-motion";

export const CARD_TIER_LABELS: Record<CardTier, string> = {
  standard: "Standard",
  "premium-static": "Premium",
  "premium-motion": "Premium Motion",
};

export const CALLING_CARD_ARTWORK = [
  { key: "futuristic", name: "Pink & Purple Futuristic", url: futuristic.url, tier: "standard" },
  { key: "gold", name: "Black & Gold", url: gold.url, tier: "standard" },
  { key: "glitch", name: "Data Glitch", url: glitch.url, tier: "standard" },
  { key: "dark-matter", name: "Dark Matter Oil Slick", url: darkMatter.url, tier: "standard" },
  { key: "autumn", name: "Autumn", url: autumn.url, tier: "standard" },
  { key: "retro", name: "Retro Cyber", url: retro.url, tier: "standard" },
  { key: "aether", name: "Aether", url: aether.url, tier: "standard" },
  { key: "eu", name: "EU", url: eu.url, tier: "standard" },
  { key: "winter", name: "Winter", url: winter.url, tier: "standard" },
  { key: "rebel-gold-flag", name: "Rebel Gold Flag", url: rebelGoldFlag.url, tier: "standard" },
  { key: "neon-glitch-union-jack", name: "Neon Glitch Union Jack", url: neonGlitchUnionJack.url, tier: "standard" },
  { key: "hazard-circuit", name: "Hazard Circuit", url: hazardCircuit.url, tier: "standard" },
] as const satisfies readonly { key: string; name: string; url: string; tier: CardTier }[];

export type CallingCardArtwork = (typeof CALLING_CARD_ARTWORK)[number];

export function getArtworkByKey(key: string | null | undefined): CallingCardArtwork | undefined {
  if (!key) return undefined;
  return CALLING_CARD_ARTWORK.find((card) => card.key === key);
}

// Server-side equip rule: a card may be equipped only when it exists in the
// registry and the player owns it. Standard cards are entry-level choices
// owned by every participant; premium tiers require a verified entitlement
// that does not exist yet, so they are never equippable here.
export function isEquippableCard(key: string): boolean {
  const card = getArtworkByKey(key);
  return Boolean(card && card.tier === "standard");
}

export const DEFAULT_RANK_ARTWORK = {
  recruit: aether.url,
  contender: winter.url,
  veteran: gold.url,
  elite: futuristic.url,
  master: darkMatter.url,
};
