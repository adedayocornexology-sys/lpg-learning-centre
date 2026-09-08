# Database decision — Supabase, not bare Postgres

Decided 8 September 2026, after the founder asked whether plain Postgres would be
cheaper and better. Researched against vendor pricing and docs the same day; every
figure below was read from the vendor's own page on 8 Sept 2026 and should be
re-checked before it is quoted to a client.

## The decision

**Supabase. Its own project, never shared with Ajasin or Sellam. Free tier. Region
Frankfurt or Ireland.**

## Why, in one line

For a three-role app with a teacher→parent note flow and consent-gated photographs,
Supabase gives us the entire security-critical layer for ₦0 — row-level security *and*
the authentication that tells those policies who is calling. Every alternative costs
either engineering hours (rolling our own auth) or money (always-on compute, Clerk
beyond the free tier), and buys nothing back at this size.

## The framing was a category error, and it is worth knowing why

"Postgres instead of Supabase" is not a real choice: **Supabase is stock Postgres**, plus
auth, storage, an auto-generated API and a dashboard. Leaving it does not mean leaving
Postgres. It means keeping Postgres and separately building or buying:

- **authentication** a parent can actually use — sign-in, reset, sessions that behave in
  Next.js middleware,
- **file storage that respects permissions**, for the consent-gated photographs,
- **the plumbing that tells the database who the caller is**, without which row-level
  policies have nothing to check.

That last one is the expensive part, and it is the part people forget.

## Row-level security is the thing we are actually buying

RLS is a **Postgres feature, not a Supabase one** — it comes with us if we ever move. What
does not come with us is `auth.uid()`: the integration that puts the signed-in person's
identity in front of every query. Without it, RLS policies have nothing to evaluate, and
the discipline shifts onto every future engineer writing every future query correctly,
forever.

For children's records, "the database refuses" has to be true even when the application
has a bug. That is the whole argument, and it is the same one made in `HARNESS.md` §3
about the consent guard.

## What was priced, and why each lost

| Option | Why not |
|---|---|
| **Neon** | Postgres only, no auth or storage. Free: 0.5 GB per project, 100 CU-hours/month, compute sleeps after 5 min idle. Fine — but we would still have to buy or build auth. |
| **Vercel Postgres** | No longer a product. Vercel retired its own Postgres in Dec 2024 and now provisions Neon or Supabase through the Marketplace — the same free tiers, billed via Vercel. |
| **Railway** | $5 trial credit for 30 days, then the "free" plan **requires a card** and allows $1/month of credit. An always-on Postgres eats that in days. Not free in practice. |
| **Render** | Free Postgres **expires 30 days after creation**, then a 14-day grace period, then Render **deletes the database and the data**. Disqualifying for a client's records. |
| **Prisma Postgres** | 200k operations/month, 500 MB. Billed per ORM operation, which is an odd shape to hand a client with unpredictable traffic. |
| **Self-hosted VPS** | ~€4.50/month for a Hetzner CX22, and then the founder personally owns backups, TLS, patching and restores — from a Celeron that cannot run a dev server. Disqualified on operations, not price. |

## Auth, had we left

- **Clerk** — free to 50,000 monthly retained users, no card. But MFA, passkeys and custom
  email templates are **not** in the free tier, and all three are things a school with
  children's data will eventually want. Pro is $25/month.
- **Auth.js / NextAuth** — free, but no longer under active feature development; MFA and
  passkeys are do-it-yourself.
- **Better Auth** — free, actively developed, MFA and passkeys as plugins — but we own the
  sessions, the security review and the consequences.

None of these is free in engineering time the way bundled auth + RLS is.

## The honest case against Supabase

1. ⭐ **A free project auto-pauses after 7 days with no API requests.** Data is retained
   and it can be resumed by hand, but a school portal between terms is exactly the traffic
   pattern that triggers it. **Fix it now, not later:** a scheduled ping against a
   health-check route. This is the one real operational gap and it is cheap to close.
2. **No African region.** Nearest is EU — Ireland or Frankfurt. Real latency from Lagos.
3. **Free tier ceilings:** 500 MB database, 1 GB file storage, 5 GB egress, 50,000 monthly
   active users, 2 active projects. The photographs will hit the 1 GB storage limit before
   anything else does. First paid tier is $25/month.

## NDPA note

**No mainstream provider has a Nigerian or African region** — this is not a Supabase
problem, it is true of every option above. Compliance therefore rests on
encryption at rest (all managed providers do this by default) and on our own consent and
processing documentation, not on finding an in-country host. Do not promise Aunty Funke
that the data stays in Nigeria. It will not, and neither would any alternative.
