import medal from "@/assets/rewards/agn-founders-medal.png.asset.json";
import emblem from "@/assets/rewards/agn-crest-emblem.png.asset.json";

/** Medal artwork (shown on profiles) vs emblem artwork (shown beside names in chat, messages and leaderboard). */
export const AGN_MEDAL = { key: "agn-crest-medal", name: "AGN Crest Medal", url: medal.url } as const;
export const AGN_EMBLEM = { key: "agn-crest-emblem", name: "AGN Crest Emblem", url: emblem.url } as const;
