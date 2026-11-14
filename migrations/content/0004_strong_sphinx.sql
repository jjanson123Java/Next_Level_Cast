CREATE TYPE "public"."gamer_type" AS ENUM('casual', 'midcore', 'hardcore', 'esports', 'mobile', 'explorer', 'social', 'competitive');--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "featured_position" integer;--> statement-breakpoint
ALTER TABLE "episodes" ADD COLUMN "gamer_types" "gamer_type"[] DEFAULT ARRAY[]::gamer_type[] NOT NULL;--> statement-breakpoint
UPDATE "episodes" AS episode SET "gamer_types" = (
  SELECT COALESCE(array_agg(DISTINCT mapped.gamer_type), ARRAY[]::gamer_type[])
  FROM unnest(ARRAY[
    CASE WHEN episode."is_free_classification" OR episode."is_non_technical" OR episode."is_beginner" THEN 'casual'::gamer_type END,
    CASE WHEN episode."is_beginner" THEN 'midcore'::gamer_type END,
    CASE WHEN episode."is_seriously" THEN 'hardcore'::gamer_type END
  ]) AS mapped(gamer_type)
  WHERE mapped.gamer_type IS NOT NULL
) WHERE episode."is_free_classification" OR episode."is_non_technical" OR episode."is_beginner" OR episode."is_seriously";--> statement-breakpoint
CREATE UNIQUE INDEX "categories_featured_position_idx" ON "categories" USING btree ("featured_position");--> statement-breakpoint
ALTER TABLE "episodes" DROP COLUMN "is_free_classification";--> statement-breakpoint
ALTER TABLE "episodes" DROP COLUMN "is_non_technical";--> statement-breakpoint
ALTER TABLE "episodes" DROP COLUMN "is_beginner";--> statement-breakpoint
ALTER TABLE "episodes" DROP COLUMN "is_seriously";--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_featured_position_check" CHECK ("categories"."featured_position" is null or "categories"."featured_position" between 1 and 2);
