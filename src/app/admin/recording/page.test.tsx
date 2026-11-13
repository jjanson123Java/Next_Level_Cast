import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/features/auth/session", () => ({ getSession }));

import AdminDashboard from "../page";
import RecordingStudioPage from "./page";

describe("protected Next Level Cast Companion launcher", () => {
  beforeEach(() => getSession.mockResolvedValue({ role: "admin", mustChangePassword: false }));

  test("adds Recording Studio to the administrator dashboard", async () => {
    render(await AdminDashboard());
    expect(screen.getByRole("link", { name: /Recording Studio/i })).toHaveAttribute("href", "/admin/recording");
  });

  test("launches only the registered local Companion action and explains readiness", async () => {
    render(await RecordingStudioPage());
    expect(screen.getByRole("heading", { name: "Next Level Cast Recording Studio" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Launch Next Level Cast Companion" })).toHaveAttribute("href", "nextlevelcast://recording");
    expect(screen.getByText(/Profile: NextLevelCastLive/)).toBeVisible();
    expect(screen.getByText(/Scene collection: NextLevelCastLive Studio/)).toBeVisible();
    expect(screen.getByText(/starts OBS when it is not running/i)).toBeVisible();
    expect(screen.getByText(/never sent to Vercel/i)).toBeVisible();
    expect(screen.getByText(/nextlevelcast-banner-hd.png/)).toBeVisible();
    expect(screen.getByText(/like-tac-podcast-opener.mp4/)).toBeVisible();
  });
});
