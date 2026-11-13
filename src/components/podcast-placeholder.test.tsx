import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { PodcastPlaceholder } from "./podcast-placeholder";

describe("PodcastPlaceholder", () => {
  test("shows branded artwork for a subject awaiting its podcast", () => {
    render(<PodcastPlaceholder subject="Gaming Culture" />);

    expect(screen.getByRole("heading", { name: "Podcast coming soon" })).toBeVisible();
    expect(screen.getByText(/will be replaced by the complete episode/i)).toBeVisible();

    expect(screen.getByAltText("Gaming Culture podcast artwork")).toHaveAttribute("src", "/brand/next-level-cast-cover.png");
  });

  test("labels the catalog placeholder without fake player controls", () => {
    const { container } = render(
      <PodcastPlaceholder subject="Gaming Culture" catalogPreview />,
    );

    expect(container.querySelector("video, audio")).toBeNull();
    expect(screen.getByText("Category preview")).toBeVisible();
  });
});
