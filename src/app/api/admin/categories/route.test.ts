import { beforeEach, describe, expect, test, vi } from "vitest";

const { db, requireAdminMock, recordAuditMock } = vi.hoisted(() => ({
  db: { select: vi.fn(), update: vi.fn(), insert: vi.fn() },
  requireAdminMock: vi.fn(),
  recordAuditMock: vi.fn(),
}));

vi.mock("@/db/content/client", () => ({ createContentDb: () => db }));
vi.mock("@/db/identity/client", () => ({ createIdentityDb: () => ({}) }));
vi.mock("@/features/admin/authorization", () => ({ requireAdmin: () => requireAdminMock() }));
vi.mock("@/features/admin/audit", () => ({ recordAudit: (...args: unknown[]) => recordAuditMock(...args) }));
vi.mock("@/features/auth/rate-limit", () => ({ requestIp: () => "127.0.0.1" }));

import { POST } from "./route";

function featureRequest(id: string, position: string) {
  const form = new FormData();
  form.set("action", "feature");
  form.set("id", id);
  form.set("featuredPosition", position);
  return new Request("https://nextlevelcast.live/api/admin/categories", { method: "POST", body: form });
}

describe("featured landing categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminMock.mockResolvedValue({ userId: "admin-1" });
  });

  test("assigns an available featured position to an active category", async () => {
    db.select.mockReturnValue({ from: async () => [
      { id: "culture", featuredPosition: null, deletedAt: null },
      { id: "lifestyle", featuredPosition: 2, deletedAt: null },
    ] });
    const where = vi.fn().mockResolvedValue(undefined);
    const set = vi.fn(() => ({ where }));
    db.update.mockReturnValue({ set });

    const response = await POST(featureRequest("culture", "1"));

    expect(response.status).toBe(303);
    expect(set).toHaveBeenCalledWith({ featuredPosition: 1, updatedAt: expect.any(Date) });
  });

  test("rejects a position already used by another active category", async () => {
    db.select.mockReturnValue({ from: async () => [
      { id: "culture", featuredPosition: null, deletedAt: null },
      { id: "lifestyle", featuredPosition: 1, deletedAt: null },
    ] });

    const response = await POST(featureRequest("culture", "1"));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "Featured position 1 is already in use." });
    expect(db.update).not.toHaveBeenCalled();
  });

  test("allows an administrator to remove a category from the landing page", async () => {
    db.select.mockReturnValue({ from: async () => [{ id: "culture", featuredPosition: 1, deletedAt: null }] });
    const where = vi.fn().mockResolvedValue(undefined);
    const set = vi.fn(() => ({ where }));
    db.update.mockReturnValue({ set });

    const response = await POST(featureRequest("culture", ""));

    expect(response.status).toBe(303);
    expect(set).toHaveBeenCalledWith({ featuredPosition: null, updatedAt: expect.any(Date) });
  });
});
