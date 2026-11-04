# src/lib rules

- App Xano calls use xano.server.ts via server functions; standalone stress tests resolve fixed credentials from environment variables outside browser bundles.
- Appearance themes ("simple-gold" default for members, "detailed", "simple-neon"; signed-in members get their saved theme from root) are pure token swaps: `[data-theme]` overrides in src/styles.css plus src/lib/theme.ts (localStorage + profiles.theme_key via the existing profile save). Never duplicate components or logic per theme.
- Calling-card equipping is server-validated in equipCallingCard (src/lib/participant.functions.ts) against the tiered registry in src/lib/calling-card-artwork.ts; premium tiers stay locked until a verified entitlement source exists.
- Premium motion cards live in their own registry (src/lib/calling-card-motion.ts), never in the equippable artwork registry; motion artwork is presentation-only and grants no rank, level, or account access.
- Card/emblem/medal unlock rules live in src/lib/unlock-rules.ts; only verified server stats unlock them, and match/bracket rules report "awaiting-data" until a verified match-data source exists.
- The official AGN account's welcome DM and first friendship are created by DB triggers (agn_welcome_member); sendDirectMessage rejects messages to the official account so welcomes stay reply-free.
