import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { createContentDb } from "@/db/content/client";
import { categories, episodes, mediaVariants } from "@/db/content/schema";
import { catalogPreviewKind, selectCatalogPreview } from "./catalog-preview";

export async function getCatalog() {
  if (!process.env.CONTENT_DATABASE_URL) return sampleCatalog.map((category) => ({ ...category, episodes: category.episodes.map((episode) => ({ ...episode, hasFullMedia: episode.hasMedia })) }));
  const db = createContentDb();
  const categoryRows = await db.select().from(categories).where(isNull(categories.deletedAt)).orderBy(asc(categories.sortOrder), asc(categories.name));
  const episodeRows = await db.select().from(episodes).where(and(eq(episodes.status, "published"), isNull(episodes.deletedAt))).orderBy(desc(episodes.publishedAt));
  const mediaRows = episodeRows.length ? await db.select({ id: mediaVariants.id, episodeId: mediaVariants.episodeId, kind: mediaVariants.kind, mimeType: mediaVariants.mimeType, createdAt: mediaVariants.createdAt }).from(mediaVariants).where(and(inArray(mediaVariants.episodeId, episodeRows.map((episode) => episode.id)), inArray(mediaVariants.kind, ["audio", "video", "teaser"]), isNull(mediaVariants.deletedAt))) : [];
  const episodeIdsWithMedia = new Set(mediaRows.map((media) => media.episodeId));
  const episodeIdsWithFullMedia = new Set(mediaRows.filter((media) => media.kind === "audio" || media.kind === "video").map((media) => media.episodeId));
  const previewRows = mediaRows.filter((media): media is typeof media & { kind: "audio" | "video" | "teaser" } => media.kind === "audio" || media.kind === "video" || media.kind === "teaser");
  return categoryRows.map((category) => ({ ...category, episodes: episodeRows.filter((episode) => episode.categoryId === category.id).map((episode) => { const preview = selectCatalogPreview(episode, previewRows); return { ...episode, hasMedia: episodeIdsWithMedia.has(episode.id), hasFullMedia: episodeIdsWithFullMedia.has(episode.id), previewMediaId: preview?.id ?? null, previewMediaKind: catalogPreviewKind(preview?.mimeType) }; }) }));
}

export async function getEpisodeBySlug(slug: string) {
  if (!process.env.CONTENT_DATABASE_URL) { for (const category of sampleCatalog) { const episode = category.episodes.find((item) => item.slug === slug); if (episode) return { episode, category, media: [] }; } return null; }
  const db = createContentDb();
  const [episode] = await db.select().from(episodes).where(and(eq(episodes.slug, slug), eq(episodes.status, "published"), isNull(episodes.deletedAt))).limit(1);
  if (!episode) return null;
  const [category] = await db.select().from(categories).where(and(eq(categories.id, episode.categoryId), isNull(categories.deletedAt))).limit(1);
  if (!category || category.deletedAt) return null;
  const media = await db.select().from(mediaVariants).where(and(eq(mediaVariants.episodeId, episode.id), isNull(mediaVariants.deletedAt))).orderBy(desc(mediaVariants.createdAt));
  return { episode, category, media };
}

const now = new Date();
const episode = (values: Partial<Record<string, unknown>> & { id: string; categoryId: string; title: string; slug: string; summary: string; publishedAt: Date }) => ({
  status: "published" as const, accessLevel: "subscriber" as const, isStartHere: false, isCurrent: false,
  gamerTypes: [] as Array<"casual" | "midcore" | "hardcore" | "esports" | "mobile" | "explorer" | "social" | "competitive">,
  hasMedia: true, previewMediaId: null, previewMediaKind: "video" as const,
  createdAt: now, updatedAt: now, deletedAt: null, ...values,
});
const sampleCatalog = [
  { id: "start-category", name: "Start Here", slug: "start-here", description: "The permanent free welcome to Next Level Cast.", sortOrder: 0, featuredPosition: null, createdAt: now, updatedAt: now, deletedAt: null, episodes: [episode({ id: "leveled-up", categoryId: "start-category", title: "Leveled Up", slug: "leveled-up", summary: "Your chill weekly gaming digest, brought to you by Next Level Cast.", accessLevel: "public", isStartHere: true, isCurrent: true, gamerTypes: ["casual", "midcore", "hardcore", "esports", "mobile", "explorer", "social", "competitive"], publishedAt: new Date("2026-11-01T12:00:00Z") })] },
  { id: "backlog", name: "The Backlog, Reviews & What We’re Playing", slug: "backlog-reviews-what-were-playing", description: "Honest impressions and what is actually worth playing.", sortOrder: 10, featuredPosition: null, createdAt: now, updatedAt: now, deletedAt: null, episodes: [] },
  { id: "culture", name: "Gaming Culture, News & Hot Takes", slug: "gaming-culture-news-hot-takes", description: "Industry shifts, patch notes, nostalgia, and the debates shaping gaming.", sortOrder: 20, featuredPosition: 1, createdAt: now, updatedAt: now, deletedAt: null, episodes: [episode({ id: "retro", categoryId: "culture", title: "Retro Revival", slug: "retro-revival", summary: "Why the tight loops and unforgettable design of arcade classics still shape modern games.", gamerTypes: ["casual", "midcore", "explorer"], publishedAt: new Date("2026-11-08T12:00:00Z") })] },
  { id: "lifestyle", name: "Gamer Lifestyle, Co-Op & Community", slug: "gamer-lifestyle-co-op-community", description: "The social side of gaming, setup talk, and balancing real life with late-night sessions.", sortOrder: 30, featuredPosition: 2, createdAt: now, updatedAt: now, deletedAt: null, episodes: [] },
];
