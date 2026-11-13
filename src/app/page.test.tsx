import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import HomePage from "./page";

const getSessionMock = vi.fn();
const getCatalogMock = vi.fn();

vi.mock("@/features/auth/session", () => ({ getSession: () => getSessionMock() }));
vi.mock("@/features/media/catalog", () => ({ getCatalog: () => getCatalogMock() }));

const episodes = [
  { id: "start", slug: "leveled-up", title: "Leveled Up", summary: "Welcome to the lobby.", isStartHere: true, accessLevel: "public", status: "published", publishedAt: new Date("2026-01-01"), hasFullMedia: true },
  { id: "retro", slug: "retro-revival", title: "Retro Revival", summary: "Arcade classics shaped modern design.", isStartHere: false, accessLevel: "subscriber", status: "published", publishedAt: new Date("2026-02-01"), hasFullMedia: true },
];

beforeEach(() => {
  getSessionMock.mockResolvedValue(null);
  getCatalogMock.mockResolvedValue([
    { id: "start-category", name: "Start Here", slug: "start-here", description: "Welcome.", sortOrder: 0, episodes: [episodes[0]] },
    { id: "culture", name: "Gaming Culture, News & Hot Takes", slug: "gaming-culture-news-hot-takes", description: "Gaming news without toxic shouting.", sortOrder: 20, episodes: [episodes[1]] },
    { id: "lifestyle", name: "Gamer Lifestyle, Co-Op & Community", slug: "gamer-lifestyle-co-op-community", description: "The social side of gaming.", sortOrder: 30, episodes: [] },
  ]);
});

describe("Next Level Cast landing page", () => {
  test("directs a visitor to Start Here and provides a sign-in cue", async () => {
    render(await HomePage());
    expect(screen.getByRole("link", { name: "Start Here — Watch Free" })).toHaveAttribute("href", "/shows/leveled-up");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
  });

  test("directs an active subscriber to the latest published episode", async () => {
    getSessionMock.mockResolvedValue({ role: "subscriber", status: "active" });
    render(await HomePage());
    expect(screen.getByRole("link", { name: "Play Latest Episode" })).toHaveAttribute("href", "/shows/retro-revival");
  });

  test("skips a newer published episode that has no playable full media", async () => {
    getSessionMock.mockResolvedValue({ role: "subscriber", status: "active" });
    getCatalogMock.mockResolvedValue([{ id: "category", name: "Gaming", episodes: [{ ...episodes[1], hasFullMedia: false }, episodes[0]] }]);
    render(await HomePage());
    expect(screen.getByRole("link", { name: "Play Latest Episode" })).toHaveAttribute("href", "/shows/leveled-up");
  });

  test("directs an administrator to the dashboard", async () => {
    getSessionMock.mockResolvedValue({ role: "admin", status: "active" });
    render(await HomePage());
    expect(screen.getByRole("link", { name: "Open Admin Dashboard" })).toHaveAttribute("href", "/admin");
  });

  test("falls back to the catalog when no appropriate episode is published", async () => {
    getCatalogMock.mockResolvedValue([]);
    render(await HomePage());
    expect(screen.getByRole("link", { name: "Browse Free Episodes" })).toHaveAttribute("href", "/shows");
  });

  test("keeps the approved promise and supporting destinations", async () => {
    render(await HomePage());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Next level\.\s*Level completed\./);
    expect(screen.getByRole("link", { name: /browse all episodes/i })).toHaveAttribute("href", "/shows");
    expect(screen.getByRole("link", { name: /sign up free/i })).toHaveAttribute("href", "/signup");
    expect(screen.queryByText(/start a podcast/i)).not.toBeInTheDocument();
  });

  test("sends curious visitors from the audience card to the full audience page", async () => {
    render(await HomePage());
    expect(screen.getByRole("link", { name: "Explore every category" })).toHaveAttribute("href", "/shows");
  });

  test("shows the latest episode from two featured category positions", async () => {
    render(await HomePage());
    expect(screen.getByRole("heading", { name: "Retro Revival" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Gamer Lifestyle, Co-Op & Community" })).toBeInTheDocument();
    expect(screen.getByText("New episodes coming soon.")).toBeInTheDocument();
  });
});
