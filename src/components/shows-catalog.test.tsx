import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ShowsCatalog, type ShowsCatalogCategory } from "./shows-catalog";

const baseEpisode = {
  summary: "Summary",
  publishedAt: new Date("2026-11-13T12:00:00Z"),
  isStartHere: false,
  isCurrent: false,
  access: "full" as const,
  hasMedia: true,
  previewMediaId: null,
  previewMediaKind: "video" as const,
  gamerTypes: [] as Array<"casual" | "midcore" | "hardcore" | "esports" | "mobile" | "explorer" | "social" | "competitive">,
};

const catalog: ShowsCatalogCategory[] = [
  {
    id: "ai",
    name: "AI in Plain English",
    description: "AI concepts made useful.",
    episodes: [
      { ...baseEpisode, id: "brain", slug: "brain", title: "Demystifying the Brain", gamerTypes: ["casual", "mobile"] },
      { ...baseEpisode, id: "basics", slug: "basics", title: "Building on the Basics", access: "teaser", gamerTypes: ["midcore", "explorer"] },
    ],
  },
  {
    id: "expressway",
    name: "Deploying Expressway",
    description: "Deployment conversations.",
    episodes: [{ ...baseEpisode, id: "deploy", slug: "deploy", title: "Deploy with Confidence", access: "teaser", gamerTypes: ["hardcore", "competitive"] }],
  },
];

describe("ShowsCatalog gamer filters", () => {
  test("renders the eight gamer filters in the approved order and shows everything initially", () => {
    render(<ShowsCatalog catalog={catalog} isSubscriber={false} />);

    const filterGroup = screen.getByRole("group", { name: "Filter episodes by gamer type" });
    expect(within(filterGroup).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Casual",
      "Midcore",
      "Hardcore",
      "Esports",
      "Mobile",
      "Explorer",
      "Social",
      "Competitive",
    ]);
    expect(screen.getByText("Demystifying the Brain")).toBeVisible();
    expect(screen.getByText("Building on the Basics")).toBeVisible();
    expect(screen.getByText("Deploy with Confidence")).toBeVisible();
  });

  test("uses OR matching for multiple selected filters and restores all episodes when cleared", () => {
    render(<ShowsCatalog catalog={catalog} isSubscriber={false} />);
    const casual = screen.getByRole("button", { name: "Casual" });
    const explorer = screen.getByRole("button", { name: "Explorer" });

    fireEvent.click(casual);
    expect(casual).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Demystifying the Brain")).toBeVisible();
    expect(screen.queryByText("Building on the Basics")).not.toBeInTheDocument();

    fireEvent.click(explorer);
    expect(screen.getByText("Demystifying the Brain")).toBeVisible();
    expect(screen.getByText("Building on the Basics")).toBeVisible();
    expect(screen.queryByText("Deploy with Confidence")).not.toBeInTheDocument();

    fireEvent.click(casual);
    fireEvent.click(explorer);
    expect(screen.getByText("Deploy with Confidence")).toBeVisible();
  });

  test("keeps categories visible and explains when none of their episodes match", () => {
    render(<ShowsCatalog catalog={catalog} isSubscriber={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Casual" }));

    const expressway = screen.getByRole("heading", { name: "Deploying Expressway" }).closest("section");
    expect(expressway).not.toBeNull();
    expect(within(expressway as HTMLElement).getByText("No episodes in this category match the selected filters.")).toBeVisible();
  });

  test("opens a signup notice when a visitor activates subscriber playback", () => {
    render(<ShowsCatalog catalog={catalog} isSubscriber={false} />);

    fireEvent.click(screen.getByRole("button", { name: /Play Building on the Basics/i }));
    expect(screen.getByRole("dialog", { name: "Building on the Basics requires membership" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Sign Up Free" })).toHaveAttribute("href", "/signup");
  });
});
