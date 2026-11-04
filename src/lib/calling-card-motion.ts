import goldSkullVideo from "@/assets/calling-cards/gold_skull.mp4.asset.json";
import goldSkullPoster from "@/assets/calling-cards/gold_skull.jpg.asset.json";
import coinsLaserVideo from "@/assets/calling-cards/coins_laser.mp4.asset.json";
import coinsLaserPoster from "@/assets/calling-cards/coins_laser.jpg.asset.json";
import turkeyNeonVideo from "@/assets/calling-cards/turkey_neon.mp4.asset.json";
import turkeyNeonPoster from "@/assets/calling-cards/turkey_neon.jpg.asset.json";
import handgunKineticVideo from "@/assets/calling-cards/handgun_kinetic.mp4.asset.json";
import handgunKineticPoster from "@/assets/calling-cards/handgun_kinetic.jpg.asset.json";
import eldritchEyesVideo from "@/assets/calling-cards/eldritch_eyes.mp4.asset.json";
import eldritchEyesPoster from "@/assets/calling-cards/eldritch_eyes.jpg.asset.json";
import clockFireworksVideo from "@/assets/calling-cards/clock_fireworks.mp4.asset.json";
import clockFireworksPoster from "@/assets/calling-cards/clock_fireworks.jpg.asset.json";
import jackpotSparkleVideo from "@/assets/calling-cards/jackpot_sparkle.mp4.asset.json";
import jackpotSparklePoster from "@/assets/calling-cards/jackpot_sparkle.jpg.asset.json";

// Premium motion calling cards: a still poster layered under a looping muted
// clip. Browser-safe presentation data only — motion artwork never determines
// rank, level, or account access, and it is not equippable until a verified
// entitlement source exists (see isEquippableCard in calling-card-artwork.ts).
export type MotionCard = {
  key: string;
  name: string;
  videoUrl: string;
  posterUrl: string;
  tier: "premium-motion";
};

export const CALLING_CARD_MOTION = [
  { key: "gold-skull", name: "Crowned Skull Broadcast", videoUrl: goldSkullVideo.url, posterUrl: goldSkullPoster.url, tier: "premium-motion" },
  { key: "coins-laser", name: "Jackpot Laser Scan", videoUrl: coinsLaserVideo.url, posterUrl: coinsLaserPoster.url, tier: "premium-motion" },
  { key: "turkey-neon", name: "Neon Turkey Showcase", videoUrl: turkeyNeonVideo.url, posterUrl: turkeyNeonPoster.url, tier: "premium-motion" },
  { key: "handgun-kinetic", name: "Kinetic Sidearm", videoUrl: handgunKineticVideo.url, posterUrl: handgunKineticPoster.url, tier: "premium-motion" },
  { key: "eldritch-eyes", name: "Eldritch Eyes", videoUrl: eldritchEyesVideo.url, posterUrl: eldritchEyesPoster.url, tier: "premium-motion" },
  { key: "clock-fireworks", name: "Clock Fireworks", videoUrl: clockFireworksVideo.url, posterUrl: clockFireworksPoster.url, tier: "premium-motion" },
  { key: "jackpot-sparkle", name: "Jackpot Sparkle", videoUrl: jackpotSparkleVideo.url, posterUrl: jackpotSparklePoster.url, tier: "premium-motion" },
] as const satisfies readonly MotionCard[];

export function getMotionCardByKey(key: string | null | undefined): MotionCard | undefined {
  if (!key) return undefined;
  return CALLING_CARD_MOTION.find((card) => card.key === key);
}
