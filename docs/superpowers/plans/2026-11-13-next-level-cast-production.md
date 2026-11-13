# Next Level Cast Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, verify, and deploy the independent Next Level Cast gaming podcast portal at `nextlevelcast.live`.

**Architecture:** Reuse the proven Next.js App Router, Drizzle, Neon, Vercel Blob, Resend, and Electron Companion boundaries from Like TAC, but rebrand the application and connect it only to newly created Next Level Cast resources. Public pages retain graceful sample-content fallbacks until storage provisioning is complete; authenticated operations fail closed when their dedicated databases are unavailable.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Playwright, Drizzle ORM, Neon Postgres, Vercel Blob, Resend, Vercel, GitHub.

**Spec:** `docs/superpowers/specs/2026-11-13-next-level-cast-production-design.md`

## Global Constraints

- Preserve Like TAC and all of its external resources unchanged.
- Use `nextlevelcast.live` as the canonical production URL.
- Keep identity DB, content DB, Blob, email, sessions, and Companion configuration independent.
- Start Here remains permanently public; subscriber content uses a 45-second preview.
- Exactly two categories may be featured on the landing page.

## Review Focus

- Missing environment variables must not break public landing/catalog rendering; authenticated mutations fail closed.
- A third featured-category selection must be rejected while two active features exist.
- Deleted or empty featured categories must not produce broken landing cards.
- Visitor, subscriber, and administrator media access must remain separated.
- Mobile navigation, card alignment, and audio-policy fallback must remain usable.

---

### Task 1: Brand foundation and public shell

**Files:**
- Modify: `package.json`, `.env.example`, `src/app/layout.tsx`, `src/components/site-header.tsx`, `src/styles/globals.css`
- Create: `public/brand/next-level-cast-logo.png`, `public/brand/next-level-cast-cover.png`, `public/media/level-completed-welcome.mp3`
- Test: `src/components/site-header.test.tsx`, `src/app/page.test.tsx`

- [ ] Replace Like TAC brand strings, colors, metadata, and cookie names.
- [ ] Add approved Next Level Cast visual and audio assets.
- [ ] Update tests for the new public shell.
- [ ] Run focused tests and commit.

### Task 2: Landing page and category experience

**Files:**
- Modify: `src/app/page.tsx`, `src/app/shows/page.tsx`, `src/features/media/catalog.ts`, `src/styles/globals.css`
- Create: `src/components/welcome-audio.tsx`
- Test: `src/app/page.test.tsx`, `src/features/media/catalog.test.ts`

- [ ] Replace the landing page with the approved gamer design.
- [ ] Add Start Here, two featured category cards, category directory navigation, and one-session audio fallback.
- [ ] Replace sample content with Next Level Cast categories and episodes.
- [ ] Run focused tests and commit.

### Task 3: Featured category persistence and administration

**Files:**
- Modify: `src/db/content/schema.ts`, `src/app/admin/categories/page.tsx`, `src/app/api/admin/categories/route.ts`
- Create: `migrations/content/0003_featured_categories.sql`
- Test: `src/db/content/schema.test.ts`, `src/app/api/admin/categories/route.test.ts`

- [ ] Add a featured landing position constrained to values 1 or 2.
- [ ] Reject duplicate/third feature assignments.
- [ ] Add admin controls and landing queries.
- [ ] Run focused tests and commit.

### Task 4: Independent configuration and initial data

**Files:**
- Modify: `.env.example`, `scripts/seed-content.ts`, `scripts/bootstrap-admin.ts`, `README.md`, `docs/operations/deployment.md`

- [ ] Configure Next Level Cast canonical URL, sender names, and admin security address.
- [ ] Seed Start Here and the three approved categories with two initial featured positions.
- [ ] Document independent Neon, Blob, Resend, and Beehiiv setup.
- [ ] Run the full unit suite and production build.

### Task 5: GitHub and Vercel release

**Files:**
- Modify: Git remote and Vercel project linkage only after verification.

- [ ] Create public GitHub repository `jjanson123Java/Next_Level_Cast` and push reviewed `main`.
- [ ] Create Git-linked Vercel project `next-level-cast` in `team_5owJL7oY72pgtOth5v9GFDdc`.
- [ ] Create and connect a private Next Level Cast Blob store.
- [ ] Provision two independent Neon databases, set environment variables, migrate, seed, and bootstrap admin.
- [ ] Stage production, run public/auth/admin acceptance tests, and promote.
- [ ] Assign `nextlevelcast.live` only after the staged deployment passes.

### Task 6: Independent final review

**Files:** none

- [ ] Review the final diff, tests, build, resource IDs, and production behavior independently.
- [ ] Resolve findings, rerun verification, and report exact deployed URL and remaining integration gaps.
