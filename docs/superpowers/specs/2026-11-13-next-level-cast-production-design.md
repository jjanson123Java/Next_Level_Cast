# Next Level Cast Production Design

## Objective

Deploy an independent gaming podcast portal at `https://nextlevelcast.live`, derived from the proven Like TAC application architecture without sharing its repository, Vercel project, databases, Blob store, sessions, email configuration, or Companion configuration.

## Brand and audience

- Brand: **Next Level Cast**
- Tagline: **Level Completed**
- Voice: relaxed gamer with subject-matter mastery; welcoming, clever, and free of gatekeeping.
- Audience: casual, mobile, midcore, hardcore, esports, explorer, social, and competitive players.
- Palette: dark near-black background, electric cyan, magenta, violet, and high-contrast white.

## Public experience

- The landing page permanently promotes the free Start Here episode, **Leveled Up**.
- Two administrator-selected featured categories show their newest published episode on the landing page.
- All categories have dedicated pages and appear in the category directory.
- Empty categories display “New episodes coming soon.”
- The episode catalog supports database-backed gamer-type filters.
- Visitors can watch Start Here completely and receive a 45-second preview of subscriber episodes.
- Free subscribers can play and download complete episodes after signing in.
- The supplied 4.3-second “Level Completed” welcome audio is used only on the landing page and plays once per signed-in browser session when browser policy permits. A visible one-time playback control is the required fallback.

## Administration

- Subscriber and administrator authentication remain separate.
- Administrator username is `admin`; security and recovery email is `jjanson10@gmail.com`.
- Admin MFA is six digits with a 30-day trusted-device option.
- Admin can create, reorder, archive, restore, and delete categories and episodes.
- Admin can choose exactly two non-deleted categories as landing-page features.
- Admin can upload media, assign multiple gamer-type tags, and manage publication state.

## Platform boundaries

- GitHub repository: `jjanson123Java/Next_Level_Cast`, public.
- Vercel project: `next-level-cast` in team `like-tac`.
- Canonical domain: `nextlevelcast.live`; `www.nextlevelcast.live` redirects to the apex when configured.
- Two independent Neon databases: identity and content.
- One independent private Vercel Blob store for podcast media.
- Transactional email uses Resend with `notifications@nextlevelcast.live` after sender-domain verification.
- Newsletter uses a separate Beehiiv publication, **Leveled Up**, after API credentials are supplied.

## Initial content

1. Start Here: **Leveled Up** (permanent, public)
2. **The Backlog & Next Obsession**
3. **Gaming Culture, News & Hot Takes**
4. **Gamer Lifestyle, Co-Op & Community**

The two initially featured categories are Gaming Culture and Gamer Lifestyle. The Backlog remains available through the category directory.

## Release safety

- Like TAC production resources must not be changed.
- Build and tests must pass before the GitHub push.
- Create the Vercel project from the reviewed GitHub repository.
- Stage and verify a production deployment before assigning `nextlevelcast.live`.
- Do not claim subscriber/admin persistence until both Neon databases are provisioned, migrated, and acceptance-tested.
