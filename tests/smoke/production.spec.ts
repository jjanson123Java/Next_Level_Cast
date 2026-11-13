import { expect, test } from "@playwright/test";

const productionUrl = process.env.PRODUCTION_URL ?? "https://nextlevelcast.live";

test("production domain serves the core public journeys", async ({ page, request }) => {
  await page.goto(productionUrl);
  await expect(page).toHaveTitle(/Next Level Cast/i);
  await expect(page.getByRole("heading", { name: /For the rest of us/i })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Sign Up Free" }),
  ).toBeVisible();

  for (const path of ["/shows", "/help", "/signup", "/sign-in", "/privacy", "/terms"]) {
    const response = await request.get(`${productionUrl}${path}`);
    expect(response.ok(), `${path} should be available`).toBe(true);
  }

  if (new URL(productionUrl).hostname === "nextlevelcast.live") {
    const wwwResponse = await request.get("https://www.nextlevelcast.live", { maxRedirects: 0 });
    expect([301, 302, 307, 308]).toContain(wwwResponse.status());
    expect(wwwResponse.headers().location).toContain("nextlevelcast.live");
  }
});
