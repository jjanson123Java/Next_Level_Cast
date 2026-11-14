import { describe, expect, test, vi } from "vitest";

describe("claimPasswordResetChallenge", () => {
  test("allows only the request that atomically marks an unused challenge", async () => {
    const module = await import("./password-reset-claim");
    const returning = vi.fn()
      .mockResolvedValueOnce([{ userId: "user-1" }])
      .mockResolvedValueOnce([]);
    const where = vi.fn(() => ({ returning }));
    const set = vi.fn(() => ({ where }));
    const tx = { update: vi.fn(() => ({ set })) };

    await expect(module.claimPasswordResetChallenge(tx as never, "challenge-1", "user-1")).resolves.toBe(true);
    await expect(module.claimPasswordResetChallenge(tx as never, "challenge-1", "user-1")).resolves.toBe(false);
    expect(set).toHaveBeenCalledWith({ usedAt: expect.any(Date) });
    expect(returning).toHaveBeenCalledTimes(2);
  });
});
