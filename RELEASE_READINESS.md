# AGN release gate — owner approval required

This PR is for Preview only. Do not merge into `main`, promote a deployment, attach
production domains, change DNS, or activate live payments until the owner approves.
An existing production deployment already exists; preparing this PR does not replace it.

## Deployment configuration

- Repository: am2788/AGN, production branch `main`, PR branch `fix/agn-deployment`.
- Build: `npm run build`. Install: `bun install --frozen-lockfile` (keep the existing lockfile).
- Explicit plugins: tsconfigPaths, tailwindcss, tanstackStart, nitro, viteReact.
- Preserve `src/server.ts` as the SSR entry. Nitro auto-detects Vercel; if needed,
  set `NITRO_PRESET=vercel`. For a local Vercel-targeted build, run
  `NITRO_PRESET=vercel npm run build`.
- No image optimizer, resize, or format-conversion pipeline was added. Existing
  PNGs are unchanged. `/skins/(.*)` has the requested immutable Cache-Control header.
  This header applies to requests on this deployment, not objects served directly
  from an external Blob/CDN hostname. Configure those objects at their origin too.
  Only use immutable caching for versioned filenames; never overwrite an existing skin URL.

## Environment setup still required

Enter credentials directly in the Vercel project's Environment Variables, choosing
Preview or Production deliberately; never send them in chat or commit them.
Use sandbox credentials for Preview. Redeploy after saving variables.

Only the six existing Supabase public/runtime configuration names were found
configured for Preview and Production during this review. The remaining names
below are requirements, not a claim that the integrations are activated.

- Existing auth: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID`,
  plus their public `VITE_SUPABASE_*` equivalents. Privileged payment/asset operations
  also need server-only `SUPABASE_SERVICE_ROLE_KEY`.
- Requested public skins URL: `VITE_SKINS_CDN_BASE`. No URL or original skin PNG set
  has been supplied, and the current app has no consumer of this variable.
  Do not invent four skin assets or convert private console media into public assets.
- Xano currently supports server-only `XANO_ORIGIN`; API group paths are constants
  in `src/lib/xano.server.ts`, not configurable group credentials. Confirm intended
  groups/auth before adding names that the source does not consume.
- Payments currently use the Lovable connector gateway: server-only `LOVABLE_API_KEY`,
  `STRIPE_SANDBOX_API_KEY`, `STRIPE_LIVE_API_KEY`, `PAYMENTS_SANDBOX_WEBHOOK_SECRET`,
  `PAYMENTS_LIVE_WEBHOOK_SECRET`. `VITE_PAYMENTS_CLIENT_TOKEN` is publishable only.
  A generic `STRIPE_SECRET_KEY` alone would not configure the current code.
- AI currently uses the Lovable gateway and requires its server-only key.
- Shopify uses server-only `SHOPIFY_STOREFRONT_TOKEN`. Product and cart requests
  run through server functions; the formerly hardcoded token has been removed.
  The shop will fail closed until the owner configures this variable. Review and
  rotate the previously committed token with the provider as appropriate.
- No Twilio Verify integration/configuration was found. Provider choice, account
  setup, credentials and implementation need confirmation.
- Never put private keys or tokens in any `VITE_` variable.

## Checks not yet satisfied

- Theme switching is a document token update, not navigation. Unit coverage checks
  the mounted form, half-typed input and URL survive all available theme changes.
  The actual Settings/profile flow requires an authenticated test session.
- Only three themes exist: Detailed, Simple Gold and Simple Neon. The requested
  fourth skin and original PNGs are missing. No fourth appearance has been invented.
- Profile validation defaults to Simple Gold, and migration
  `0013_gold_default_theme.sql` sets the database default. Migrations have NOT been
  applied or verified against the connected backend. Root theme sync loads the
  saved profile theme on sign-in; authenticated end-to-end behavior remains unverified.
- The shared mobile hook, Tailwind `md` breakpoint and narrow-screen CSS rule now
  switch at 900px for all themes. Hook boundary tests cover 899px and 900px.
  Full visual verification of all four skins remains blocked by the missing fourth skin.
- Console/admin pages render signed-out gates. Private server functions use auth
  middleware and admin monitoring checks the trusted admin role. This is not a
  full authorization/security audit; authenticated role tests remain required.
- Stripe webhook route is `/api/public/payments/webhook?env=live` (or `env=sandbox`).
  Omitting `env` returns an ignored response, so a 200 alone does not prove payment
  delivery. After cutover, configure the provider endpoint for
  `https://topgamer.gg/api/public/payments/webhook?env=live`, use its signing secret,
  and verify a signed test delivery AND the intended database update. No live payment
  or new-domain webhook test has been performed.

## Domain cutover — deferred

Neither `topgamer.gg` nor `www.topgamer.gg` is attached to AGN. Domain ownership is
already in the connected Vercel team. DNS currently delegates to
`grace.ns.cloudflare.com` and `tosana.ns.cloudflare.com`; changing records at the
registrar NicNames alone will not change that authoritative zone.

At approval time:

1. Attach both domains to AGN, redirect `www` to `https://topgamer.gg` so apex is canonical.
2. Re-run Vercel domain verification and use its freshly returned records at the
   authoritative DNS host. Preserve unrelated mail/TXT records.
3. Current project-specific diagnostic recommendation (recheck before applying):
   CNAME `@` and CNAME `www` to `67b1ccbf5f0df996.vercel-dns-017.com.` with proxy
   disabled. Apex CNAME requires the DNS host's flattening support. Do not apply
   these records before owner approval.
4. Verify DNS, certificates, both hostnames and redirect behavior, then send the
   signed Stripe test delivery and verify its processing.
5. Owner signs off on the tested release before production promotion/merge.
