# Master integration — DRAFT, not a production release

This branch combines the runnable frontend from the existing deployment work with
reviewed registry/audio foundations from `feature/skin-themes-season1`. No production
promotion, Cloudflare provisioning, credential rotation or backend migration is performed.

## Implemented application code

- Six theme keys: simple-gold (default), simple-neon, skin-gold, skin-redneon,
  skin-blueneon, skin-cyber. Legacy `detailed` profiles normalize to simple-gold.
- Stable global SkinScreen around the route outlet; theme changes update a root
  data attribute without theme-dependent keys. The 900px shared breakpoint selects
  desk/mob. Shells are decorative original PNG img elements with object-fit contain,
  locked 16:9 / square Overchat / 9:16 stage aspect ratios and no optimizer calls.
- Registry covers 19 screens and hall states, standard layers and supported 4K
  desktop shells. Hall paths use `/hall/desk/`, not `/gold/desk/`.
- SkinHotspot supports percentage-positioned live DOM controls. Final per-screen
  coordinates are NOT invented: original artwork and approved hotspot layouts
  must be provided to align every control precisely. Existing live layouts are
  retained rather than flattening controls into screenshots. Artwork failure never
  removes the controls. A skin wrapper alone is not a completed art/layout integration.
- Global theme selection preserves routes and drafts. `/me/theme` GET/PATCH proxy
  authoritative Xano values when that endpoint is provisioned and explicitly enabled.
  Local-only appearance is visibly labeled when persistence fails. Changes are
  serialized so older saves cannot overtake newer saves.
- `/signup` and `/auth` use Xano. Four signup steps retain entered fields. Media
  starts only on user action; mute, playback errors and silent continuation exist.
  Successful registration cuts ambience and the motion loop, then starts one
  non-looping greeting. Its ended event or Continue enters `/overchat`.
  Failed registration never starts the greeting or navigates.
- Auth tokens are never returned to browser code. Sessions use encrypted/sealed,
  HttpOnly, Secure, SameSite=Lax, host-only cookies with one-day expiry and disabled
  session-header overrides. Mutations check Origin; identity is revalidated through
  Xano auth/me. No client user ID is trusted for private access.
- `/dashboard` and `/overchat` gate on Xano identity. The Overchat/Messenger entry is
  a deliberate unavailable state until private messaging contracts are implemented;
  it does NOT fabricate AETHER friendships or messages.
- Existing Supabase admin, console, friends, purchases and roles are intentionally
  not bridged to Xano identity. `/legacy-auth` preserves existing Supabase sign-in.
  A Xano login does not grant legacy admin/purchase permissions. Full provider migration
  and role mapping remain required before this branch can replace production auth.
- Local-file player has ten peaking filters (31–16000Hz), gain/Q controls, low/high
  cuts, smoothed gain changes and 0–200% output gain ahead of a compressor. There is
  one series graph; no solo/bypass edge avoids the compressor. Local tracks are never
  uploaded and object URLs/context are cleaned up. A DynamicsCompressorNode is not
  a guaranteed brick-wall limiter and cannot guarantee hearing safety; start quietly.

## Environment setup

Configured on the AGN project for Preview and Production:

- `VITE_SKINS_CDN_BASE=https://cdn.topgamer.gg/skins` (public configuration only).
- `NITRO_PRESET=vercel`.

These values do not create an R2 bucket, upload assets or configure cdn DNS. The
original skins/media and Cloudflare-side setup are still unavailable.

Owner must enter credentials directly into Vercel Environment Variables, with separate
Preview and Production values. Do not send credentials in chat or commit env files:

- `XANO_BASE_URL`: HTTPS instance origin, no credentials, path, query or fragment.
- `XANO_AUTH_GROUP_KEY`, `XANO_PLATFORM_GROUP_KEY`: the Xano `api:<canonical>` group
  path components, not user authentication credentials. Rotate/confirm the intended
  canonical paths with Xano; do not mistake group IDs for authorization. Session
  bearer tokens are obtained by authenticating the user, never prefixed with VITE_.
- `SESSION_SECRET`: at least 32 cryptographically random bytes encoded as 64+ hex
  characters. Generate and enter it yourself; cookie contents are sealed, not plaintext.
- `XANO_THEME_ENDPOINT_ENABLED=true`: only AFTER the backend endpoint below exists
  and owner-auth checks are validated. Default is fail-closed.
- Existing Supabase and Lovable connector integration variables are still required
  for legacy features. `SHOPIFY_STOREFRONT_TOKEN` is server-only.
- Merely adding `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` does not migrate the
  existing Lovable payment connector implementation. Direct Stripe, Twilio and AI
  provider migration need actual provider contracts and tests. No placeholders are
  inserted into live environment configuration.

The immutable `/skins/(.*)` response header remains in vercel.json. It affects this
Vercel hostname only, not responses served directly by cdn.topgamer.gg. Configure R2
object metadata/cache policy separately and use versioned asset names. Header rules
are not switches that disable image optimization; direct PNG URLs avoid that pipeline.

## Required authoritative Xano changes (NOT deployed or simulated)

The updated main branch now includes Xano contracts under workspace/antonio_workspace_2.
These exports have been preserved, but deployment and live behavior are unverified.
The ensure_agn_onboarding and claim_first_strike function exports have empty stacks
and return null. onboarding/complete hardcodes official user ID 1 and may create an
admin account; it is not safe to call without backend review. These exports are
insufficient to establish the required guarantees against a live Xano instance. Provide the authenticated OpenAPI/schema and a supported backend deployment
path. Frontend success, session cookies and a READY build are not evidence that these
backend requirements exist:

1. GET/PATCH `me/theme` in the platform API group: bearer-authenticated, derive the
   owner from auth.id, accept exactly the six keys, default new members to simple-gold,
   return `{ theme_id }` (the frontend proxy normalizes this to `{ theme }`), reject client-selected owner IDs. Persist transactionally.
2. Registration transaction: create identity + profile + AETHER accepted friendship +
   one welcome DM together. Use configured immutable AGN_OFFICIAL_USER_ID, enforce
   unique friendship and welcome-message keys, and rollback all on failure. Official
   message: “Thank you deeply for joining Aether Gaming Networks. We’re grateful
   you’re here and excited to welcome you to the AGN community. — AETHER”. No
   fabricated account ID or client-inserted friendship is acceptable.
3. Private profile, jackpot/vault and safety endpoints must define response schemas,
   owner/admin authorization and audit rules. Do not expose the public exported
   participant-profile handler as an unrestricted private-data proxy. Safety flags
   must never be client-granted identity verification. Vault values must come from
   a server ledger, not decorative prize labels.
4. First Strike MUST be awarded only in the verified slot-purchase transaction.
   Validate the Stripe signature over raw bytes, deduplicate event and purchase IDs,
   resolve user/tournament/price from server records, verify eligibility, exclude
   spectators/admins, lock a unique award scope, and atomically mark payment, claim
   the award and append its ledger entry. A unique DB constraint must make parallel
   first purchases produce one winner, with replay-safe webhook delivery.
   The root-level legacy Xano register export currently grants First Strike at signup using an
   exists-then-write pattern; teams_create also has a non-atomic claim. These exports
   MUST NOT be used for this requirement. This branch does not call register or
   teams_create for awards, and does not claim that the unsafe upstream exports
   have been repaired or deployed. Define whether “first” is global or per tournament
   before backend schema changes.
5. Private Overchat/messages, official user resolution and participant roles must be
   available under Xano authorization before the chat entry can become functional.

## Release blockers

Missing source PNGs/video/audio, final percentage hotspot maps, live Xano endpoint
contracts, transactional backend changes, credentials, provider migration and an
authenticated preview test setup prevent calling this production-grade or complete.
Unit tests can verify media ordering with mocks but cannot prove real playback,
identity creation, welcome friendship or financial settlement. Do not merge/promote
until those checks and owner sign-off are recorded.

## Local validation for this draft

- Frozen Bun install succeeds; all 176 existing/integration tests pass across 29 files.
- Two additional contract tests pass for the updated Xano theme_id request/response schema.
- TypeScript and focused lint on integration modules pass.
- Vercel-targeted production build succeeds with the supplied CDN base and Nitro preset.
- Imported legacy source still has broad formatting/lint debt. The original generated
  Supabase integration files retain their pre-existing whitespace; they are not rewritten
  for style. Backend exports are preserved byte-for-byte from current main.
- Browser verification is recorded in the PR after its exact preview becomes READY.
