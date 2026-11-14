import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("gamer type migration", () => {
  test("backfills every legacy classification before dropping its source columns", () => {
    const sql = readFileSync("migrations/content/0004_strong_sphinx.sql", "utf8");
    const updateAt = sql.indexOf("UPDATE \"episodes\"");
    const firstDropAt = sql.indexOf("DROP COLUMN");

    expect(updateAt).toBeGreaterThan(-1);
    expect(firstDropAt).toBeGreaterThan(updateAt);
    for (const legacyColumn of ["is_free_classification", "is_non_technical", "is_beginner", "is_seriously"]) {
      expect(sql.slice(updateAt, firstDropAt)).toContain(legacyColumn);
    }
  });
});
