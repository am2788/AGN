<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the arena layout in its own browser-safe component using the shared Radix accordion controls; this preserves keyboard access and isolates registration behavior.
- The public homepage uses a browser-safe game hub, while /arena preserves schedules and registration; typed lane search opens the selected bracket without changing its rules. Unprovided social destinations stay disabled rather than fabricated.
- /arena is an Outlet-based persistent browser-safe command shell with index and validated section routes; unavailable telemetry never becomes fake live values, and local media stays session-only.
- Tournament registration uses a separate Radix dialog, shared pricing/schema module, and authenticated server function with owner-only unpaid registration rows; it never confers paid access or wager verification.
- /gateway separates browser-safe tiers and local-only ID previews from ranks/settlement; stop camera tracks and revoke previews on exit. Acknowledgements never verify ID or enable checkout; Rewards preserves all-age registration.
- Checkout previews use a separate installment quote module, disabled card fields and example-labeled outcomes; visual states never modify registrations, verified identity or entitlements. The Final Hardlock is a preview-only confirmation screen: it never confirms payment, locks a registration, or issues a prestige token.
- Participant profiles separate editable display fields from server-owned rewards; account entries remain private and leaderboard participation requires opt-in to minimize exposure for all-age participants.
- Admin monitoring uses trusted user_roles assignments and a server-checked aggregate RPC; never auto-promote signups, expose participant details, or substitute account totals for live telemetry.
- Engagement awards use a replay-safe server-only ledger with database-derived rank and cosmetic validation; clients never submit points or bracket results.
- Gemini Avatar Forge authenticates each request, checks authoritative points, streams through the gateway helper, and stores profile imagery privately; durable fail-closed generation locks prevent blocked retries.
- Keep one root session subscriber for account affordances and cache invalidation; sign-out cancels requests, clears private caches, and replaces navigation history.
- Merchandise uses the Shopify Storefront API with persistent Zustand cart state and API-issued checkout URLs; never fabricate products or checkout links.
- Do not fabricate competition deadlines: show unscheduled timer placeholders until an actual schedule is supplied.
- Keep public tournament cover art separate from the Canva console asset registry; only load the latter after a verified session on deep console asset routes to avoid mixing consoles into public gates.
- Date-only Master Over-Clock schedules default to midnight UTC and visibly state that timezone; this avoids silently inventing an event start time.
- Canva console media lives only in the private console-assets storage bucket and is served via short-lived signed URLs from an auth-required server function; never bundle console media as public assets.
- Wagers live in a dedicated /wagers route (WagerSection component) reached via the PortalTabs switcher; tournament lanes never contain betting controls, keeping brackets and wagering concerns separate.
- Keep shared recurring regional segments in the arena data module and derive every lane's schedule from them; one hydrated clock drives all countdowns, with segment-window labels never implying a verified live match.
- Keep public AGN crest rendering, shared navigation, and console branding badges in one browser-safe brand module using the official CDN asset pointer; never mix the public brand mark with private console media.
- The schedule helper is a stateless question-and-answer form, not a stored chat; derive its timezone cards from the shared schedule and keep AI calls plus durable denial state server-side to prevent invented times and automatic blocked retries.
- Calling cards share one browser-safe presentation component with points-derived levels and rank badges, and a public CDN artwork registry for default art and showcase overrides; uploaded samples and artwork never override authoritative participant rewards or access.
- The public calling-card showcase defaults to clickable terminal-style vertical rows with a compact matrix alternative and an accessible inspection dialog; preview-only clan labels never affect account identity, points-derived ranks, levels, or purchased access, and missing animation assets remain static artwork.
- Home-screen support uses a manifest and official-crest icons with the existing leaderboard route; do not add an app-shell service worker without an explicit offline request.
- Public pages never display payment or launch-special status (premium/standard states, payment verification notices) — the lobby is public; entitlements stay between the operator and the customer. Premium access comes only from trusted payment verification, checked privately.
- Featured animated showcase cards (Forbidden Stash, Stickman Firefight) layer a CDN poster under a looping muted MP4 with a neon overlay; reduced-motion visitors get the poster only, and premium labels stay example-marked until payment verification exists.
- Registration status is an admin-only database setting enforced by an insert trigger on tournament entries, so paused/closed blocks every path, not just the form.
- Broadcast Theatre keeps its browser-safe terminal sandbox and deterministic playback rules separate from the shutter stage; all public corrections are session-only examples and never write official scores, telemetry or payments.
- Theatre title metadata is separate from bracket-based pricing, and switching titles resets sample state; this prevents title-specific prize drift and carrying sample scores into another game.
- Seasonal title voting window lives in src/lib/season-vote.ts and is mirrored by the title_votes insert policy; change both together so the database never accepts votes the UI says are closed.
