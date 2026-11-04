# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploy to Vercel

This repository uses the TanStack Start framework preset and Nitro's `vercel`
preset. Vercel installs the Bun lockfile with `bun install --frozen-lockfile` and
builds with `bun run build`.

Configure these variables in Vercel for Preview and Production; do not commit
`.env` files:

- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`

The `VITE_` variables are public browser configuration, never private keys.
Some optional features additionally require server-only credentials:
`SUPABASE_SERVICE_ROLE_KEY` for privileged server operations and `LOVABLE_API_KEY`
for the schedule helper and avatar generation. Keep those unprefixed and secret.
Database migrations in `drizzle/migrations` are not applied by the build.

The updated frontend also includes payments, friends/messaging, profile themes,
and Xano-backed server functions. These features require their corresponding
backend schema and policies; importing this source does not apply migrations or
verify those integrations. Xano can use a server-only `XANO_ORIGIN` override.

Payments currently route through Lovable's connector gateway, not directly to
Stripe. They require server-only `LOVABLE_API_KEY`, `STRIPE_SANDBOX_API_KEY` /
`STRIPE_LIVE_API_KEY`, and `PAYMENTS_SANDBOX_WEBHOOK_SECRET` /
`PAYMENTS_LIVE_WEBHOOK_SECRET` for the selected environment. The browser uses
`VITE_PAYMENTS_CLIENT_TOKEN` for the publishable Stripe key only. Never place
server credentials in a `VITE_` variable. Payment flows have not been verified.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
