# Next Level Cast deployment runbook

## Production resources

- GitHub: `jjanson123Java/Next_Level_Cast`
- Vercel team/project: `like-tac/next-level-cast`
- Vercel project ID: `prj_fsHPTWrQ5W86AMDvcyp0G3dad25J`
- Identity Neon resource: **not yet provisioned** (must be a new Next Level Cast-only resource)
- Content Neon resource: **not yet provisioned** (must be a second new Next Level Cast-only resource)
- Private Blob store: `next-level-cast-media` (`store_phoowsqMnIw4C6oo`)
- Transactional email resource: **not yet provisioned** (must be Next Level Cast-only)
- Canonical domain: `nextlevelcast.live`; `www.nextlevelcast.live` redirects to the canonical host

Only resource names and IDs belong in source control. Secrets remain in Vercel environment variables. Never substitute a Like TAC database, Blob store, email resource, or project.

## Required environment keys

Runtime requires `IDENTITY_DATABASE_URL`, `CONTENT_DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_USERNAME`, `ADMIN_SECURITY_EMAIL`, and `NEXT_PUBLIC_SITE_URL`. `ADMIN_BOOTSTRAP_PASSWORD` is a one-time initialization secret: add it only while running the administrator bootstrap, then remove it from every Vercel environment after the permanent password is set.

## Release sequence

1. Confirm the intended Vercel target with `vercel project inspect --non-interactive`.
2. Run `npm ci`, `npm test`, `npm run test:e2e`, `npm run build`, and `npm audit --omit=dev`.
3. Pull environment variables without printing values.
4. Apply identity and content migrations separately, including the short-lived Companion upload handoff table.
5. Run the idempotent administrator bootstrap and content seed scripts.
6. Deploy a preview and verify visitor, subscriber, administrator, media, Help, mobile, and theme journeys.
7. Stage a production deployment without assigning domains, repeat smoke tests, then promote that exact deployment.
8. Verify `nextlevelcast.live`, `www` redirect, DNS, TLS, and recent Vercel error logs.

## Database commands

```bash
npm run db:migrate:identity
npm run db:migrate:content
npm run db:bootstrap-admin
npm run db:seed-content
```

Drizzle does not automatically read `.env.local`; load the environment into the process before running these commands.

## Content operations

Full audio/video, generated previews, captions, and transcripts are private Blob objects. Neon stores only catalog/security metadata, object paths, and hashed short-lived handoff state. Start Here is fully playable for visitors. Protected episodes expose only a generated preview; when a direct website upload has no preview, visitors receive a locked branded card. Full protected media must never be used as the visitor preview.
