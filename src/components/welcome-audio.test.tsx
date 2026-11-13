import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { WelcomeAudio } from "./welcome-audio";

describe("WelcomeAudio", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  test("does not render for visitors", () => {
    render(<WelcomeAudio enabled={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("offers a playback fallback when audible autoplay is rejected", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValueOnce(new DOMException("blocked"));
    render(<WelcomeAudio enabled />);
    expect(await screen.findByRole("button", { name: "Play welcome audio" })).toBeInTheDocument();
  });

  test("marks the welcome as played after the fallback is selected", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValueOnce(new DOMException("blocked")).mockResolvedValueOnce();
    render(<WelcomeAudio enabled />);
    fireEvent.click(await screen.findByRole("button", { name: "Play welcome audio" }));
    await waitFor(() => expect(sessionStorage.getItem("nextLevelWelcomePlayed")).toBe("true"));
  });
});
