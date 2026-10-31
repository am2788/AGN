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
export const CALLING_CARD_ARTWORK = [
  { key: "futuristic", name: "Pink & Purple Futuristic", url: futuristic.url },
  { key: "gold", name: "Black & Gold", url: gold.url },
  { key: "glitch", name: "Data Glitch", url: glitch.url },
  { key: "dark-matter", name: "Dark Matter Oil Slick", url: darkMatter.url },
  { key: "autumn", name: "Autumn", url: autumn.url },
  { key: "retro", name: "Retro Cyber", url: retro.url },
  { key: "aether", name: "Aether", url: aether.url },
  { key: "eu", name: "EU", url: eu.url },
  { key: "winter", name: "Winter", url: winter.url },
  { key: "rebel-gold-flag", name: "Rebel Gold Flag", url: rebelGoldFlag.url },
  { key: "neon-glitch-union-jack", name: "Neon Glitch Union Jack", url: neonGlitchUnionJack.url },
  { key: "hazard-circuit", name: "Hazard Circuit", url: hazardCircuit.url },
] as const;

export const DEFAULT_RANK_ARTWORK = {
  recruit: aether.url,
  contender: winter.url,
  veteran: gold.url,
  elite: futuristic.url,
  master: darkMatter.url,
};