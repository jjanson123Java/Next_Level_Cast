CREATE TYPE "public"."gamer_type" AS ENUM('casual', 'midcore', 'hardcore', 'esports', 'mobile', 'explorer', 'social', 'competitive');--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "featured_position" integer;--> statement-breakpoint
ALTER TABLE "episodes" ADD COLUMN "gamer_types" "gamer_type"[] DEFAULT ARRAY[]::gamer_type[] NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_featured_position_idx" ON "categories" USING btree ("featured_position");--> statement-breakpoint
ALTER TABLE "episodes" DROP COLUMN "is_free_classification";--> statement-breakpoint
ALTER TABLE "episodes" DROP COLUMN "is_non_technical";--> statement-breakpoint
ALTER TABLE "episodes" DROP COLUMN "is_beginner";--> statement-breakpoint
ALTER TABLE "episodes" DROP COLUMN "is_seriously";--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_featured_position_check" CHECK ("categories"."featured_position" is null or "categories"."featured_position" between 1 and 2);