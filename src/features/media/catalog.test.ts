import { afterEach, describe, expect, test, vi } from "vitest";
import { selectNewestMediaPair } from "./catalog-preview";

const { db, rows } = vi.hoisted(() => ({ db: { select: vi.fn() }, rows: [] as unknown[][] }));
vi.mock("@/db/content/client", () => ({ createContentDb: () => db }));

describe("selectNewestMediaPair", () => {
  test("returns the newest full recording and teaser independently", () => {
    const pair = selectNewestMediaPair([
      { id: "old-video", episodeId: "episode-1", kind: "video", mimeType: "video/mp4", createdAt: new Date("2026-01-01") },
      { id: "new-video", episodeId: "episode-1", kind: "video", mimeType: "video/mp4", createdAt: new Date("2026-01-03") },
      { id: "new-teaser", episodeId: "episode-1", kind: "teaser", mimeType: "video/mp4", createdAt: new Date("2026-01-04") },
    ]);

    expect(pair.full?.id).toBe("new-video");
    expect(pair.teaser?.id).toBe("new-teaser");
  });
});

describe("getEpisodeBySlug", () => {
  afterEach(() => {
    delete process.env.CONTENT_DATABASE_URL;
    db.select.mockReset();
    rows.length = 0;
    vi.resetModules();
  });

  test("does not expose an episode whose category was deleted", async () => {
    process.env.CONTENT_DATABASE_URL = "postgres://content";
    rows.push(
      [{ id: "episode-1", categoryId: "category-1", slug: "hidden", status: "published", deletedAt: null }],
      [{ id: "category-1", slug: "deleted", deletedAt: new Date("2026-01-01") }],
      [],
    );
    db.select.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: async () => rows.shift() ?? [],
          orderBy: async () => rows.shift() ?? [],
        }),
      }),
    }));
    const { getEpisodeBySlug } = await import("./catalog");

    await expect(getEpisodeBySlug("hidden")).resolves.toBeNull();
  });
});
