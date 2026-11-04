# AGN launch completion (release instruction)

- [x] Verify both Simple themes switch without losing route/session/form state — distinct tokens confirmed, textarea input preserved, no navigation or new requests on switch
- [x] Verify cosmetic collection: standard equip server-validated (tests), premium fail-closed, equipped art on account/leaderboard/OverChat, 7 motion cards play on scroll-in, reduced-motion gets posters only
- [x] Run full test suite + typecheck + production build — 153/153 tests pass, tsgo clean, build OK
- [ ] Medals & emblems — BLOCKED: approved 40-medal definitions, requirement text and unlock rules never supplied; no match/K-D data source exists. Emblem artwork uploads exist but no definitions to attach them to.
- [x] Release report in chat (Vercel/PR not applicable — Lovable hosting, git managed internally)

# Owner account, social & safety (Nov 4)
- [x] Owner account (midwest.ops) gets admin + becomes official AGN account on email confirmation; admins are outside First Strike rules
- [x] Friend requests, friends-only private messages (/friends)
- [x] Message safety screen (pattern + AI), held messages go to admin Safety queue; admin bans → authority report queued with fingerprint
- [x] New members auto-friended with the official AGN account
- [x] Welcome DM rewritten warmer/thankful (0016_warmer_agn_welcome); replies still blocked
- [ ] Emblem inside calling card next to names in Overchat/leaderboard — BLOCKED on medal/emblem definitions
- [ ] Tap calling card → profile page, follow profiles/streamers
- [ ] Admin hardware screen + connection alerts — waiting on hardware
- [ ] Restyle dashboard/Overchat with new controls design as a theme
- [ ] Minor/adult detection needs an age stored on profiles (not collected today)
- [ ] Authority report sending — needs NCMEC CyberTipline registration; reports are queued only
- [x] Final front-end vs back-end audit (first pass Nov 4): every screen has a working backing (or a labeled placeholder) and every backend feature has a screen — run before launch sign-off

# Owner answers (Nov 4, later)
- [x] Simple Gold is the default theme for new members, applied on sign-in
- [x] Premium & motion calling cards hidden from the public showcase
- [ ] Age + ID screening for everyone — needs an ID-verification provider choice
- [ ] CyberTipline registration — owner is handling
- [x] Draft unlock rules for cards 51–93, 50 emblems × 4 tiers, 40 medals (src/lib/unlock-rules.ts) — owner to approve thresholds
- [ ] Rank ladder, missing emblem pictures — owner uploading
- [ ] Verified match-data source for in-game milestones/achievements
- [ ] Hardware screen — hardware arriving in days
