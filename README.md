# Next Level Cast Podcast Portal

Production Next.js portal for [nextlevelcast.live](https://nextlevelcast.live): a relaxed gaming podcast for every genre, platform, and player archetype.

## Brand media

Next Level Cast artwork lives in `public/brand/`; the one-time member welcome audio is stored at
`public/media/level-completed-welcome.mp3`. Empty categories and episodes without uploaded media use
branded still artwork rather than inherited Like TAC media.

Catalog previews have no native player controls. They begin muted and cycle through the 7-second opener,
a 3-second excerpt at `0:17`, and a 3-second excerpt at `0:27`. After that single cycle, the preview
returns to `0:00`, shows the opening frame, and stops to avoid continuous bandwidth use. The catalog
offers only Mute/Unmute, honors reduced-motion preferences, supports audio-only previews with branded
artwork, and uses teaser media for protected archive episodes. Opening an episode provides the normal
media controls.

## Features

- Free visitor access to Start Here and the current New Episode
- Subject/date catalog with 45-second teasers for the member archive
- Free subscriber accounts with playback and downloads
- Username recovery, password reset instructions, suggested passwords by email, and five-password history
- Separate administrator login with emailed MFA and optional 30-day trusted devices
- Administrator category, episode, upload, publish, unpublish, and recoverable-delete workflows
- Private Vercel Blob media storage
- Separate Neon identity/security and content/metadata databases
- Role-aware Help, accessible light/dark themes, and responsive navigation

## Optional social links

Add only confirmed accounts to `src/config/social-links.ts`. Supported services are YouTube, Twitch,
X / Twitter, Instagram, and Discord. Each entry needs an HTTPS URL and display label. Blank or unsafe
entries are omitted. The links sit beside the footer brand, wrap when needed, and stack below the brand
on small screens. Next Level Cast keeps this list empty until its own accounts are ready to publish.

## Local verification

```bash
npm install
npm test
npm run build
npm run test:e2e
```

Copy `.env.example` to `.env.local` only for local development. Never commit connection strings, email keys, Blob tokens, bootstrap credentials, or downloaded Vercel environment files.

## Deployment

See [deployment.md](docs/operations/deployment.md), [recovery.md](docs/operations/recovery.md), and [companion.md](docs/operations/companion.md).
