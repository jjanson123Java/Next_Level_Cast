import { eq } from "drizzle-orm";
import { categories, episodes } from "../src/db/content/schema";
import { createContentDb } from "../src/db/content/client";

const seeds = [
  { name: "Start Here", slug: "start-here", description: "The permanent free welcome to Next Level Cast.", sortOrder: 0, featuredPosition: null },
  { name: "The Backlog, Reviews & What We’re Playing", slug: "backlog-reviews-what-were-playing", description: "Honest impressions, backlog management, and what is actually worth playing.", sortOrder: 10, featuredPosition: null },
  { name: "Gaming Culture, News & Hot Takes", slug: "gaming-culture-news-hot-takes", description: "Industry shifts, patch notes, nostalgia, and the debates shaping gaming.", sortOrder: 20, featuredPosition: 1 },
  { name: "Gamer Lifestyle, Co-Op & Community", slug: "gamer-lifestyle-co-op-community", description: "The social side of gaming, setup talk, and balancing real life with late-night sessions.", sortOrder: 30, featuredPosition: 2 },
];

const db = createContentDb();
for (const seed of seeds) await db.insert(categories).values(seed).onConflictDoUpdate({ target: categories.slug, set: { name: seed.name, description: seed.description, sortOrder: seed.sortOrder, featuredPosition: seed.featuredPosition, updatedAt: new Date(), deletedAt: null } });
const [startHere] = await db.select().from(categories).where(eq(categories.slug, "start-here")).limit(1);
await db.insert(episodes).values({ categoryId: startHere.id, title: "Leveled Up", slug: "leveled-up", summary: "Your chill weekly gaming digest, brought to you by Next Level Cast.", status: "published", accessLevel: "public", isStartHere: true, isCurrent: true, gamerTypes: ["casual", "midcore", "hardcore", "esports", "mobile", "explorer", "social", "competitive"], publishedAt: new Date("2026-11-01T12:00:00Z") }).onConflictDoUpdate({ target: episodes.slug, set: { categoryId: startHere.id, title: "Leveled Up", summary: "Your chill weekly gaming digest, brought to you by Next Level Cast.", status: "published", accessLevel: "public", isStartHere: true, isCurrent: true, gamerTypes: ["casual", "midcore", "hardcore", "esports", "mobile", "explorer", "social", "competitive"], deletedAt: null } });
console.log(`Seeded ${seeds.length} Next Level Cast categories and the permanent Start Here listing.`);
