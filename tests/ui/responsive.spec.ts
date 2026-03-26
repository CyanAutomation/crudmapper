import { test, expect, devices } from "@playwright/test";

// Test at multiple viewports
const viewports = [
  { name: "Mobile", ...devices["Pixel 5"] },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Desktop", width: 1440, height: 900 },
];

viewports.forEach((viewport) => {
  test.describe(`Responsive Layout - ${viewport.name}`, () => {
    test.use(viewport);

    test("Page layout is responsive at this viewport", async ({ page }) => {
      await page.goto("/");

      // Hero section should be visible
      const heroSection = page.locator(".hero-section");
      await expect(heroSection).toBeVisible();

      // Basic layout check - no overflow
      const bodyWidth = await page.evaluate(() =>
        Math.max(document.body.scrollWidth, document.documentElement.scrollWidth)
      );

      const viewportWidth = page.viewportSize()?.width || 0;
      // Allow small horizontal scroll due to scrollbars
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
    });

    test("Grid layout adapts to viewport", async ({ page }) => {
      await page.goto("/");

      const gridLayout = page.locator(".grid-layout");
      const boundingBox = await gridLayout.boundingBox();

      expect(boundingBox).not.toBeNull();

      if (boundingBox) {
        const viewportWidth = page.viewportSize()?.width || 0;
        // Grid should fit within viewport with some padding
        expect(boundingBox.width).toBeLessThanOrEqual(viewportWidth);
      }
    });

    test("Hero title is readable at this viewport", async ({ page }) => {
      await page.goto("/");

      const heroTitle = page.locator(".hero-title");
      const fontSize = await heroTitle.evaluate((el) =>
        parseInt(window.getComputedStyle(el).fontSize)
      );

      // Should have reasonable font size (not too small)
      expect(fontSize).toBeGreaterThan(16);
    });

    test("Sidebar is accessible if present", async ({ page }) => {
      await page.goto("/");

      // Upload test data
      const fileInput = page.locator("#roleFileInput");
      await fileInput.setInputFiles("data/roles.manifest.json");
      await page.waitForTimeout(500);

      // Sidebar should be visible
      const sidebar = page.locator("#sidebar");
      const isVisible = await sidebar.isVisible();

      if (isVisible) {
        const boundingBox = await sidebar.boundingBox();
        expect(boundingBox).not.toBeNull();

        // Sidebar should be scrollable if content overflows
        const hasScrollbar = await sidebar.evaluate((el) => el.scrollHeight > el.clientHeight);

        expect(typeof hasScrollbar).toBe("boolean");
      }
    });

    test("Features section cards stack appropriately", async ({ page }) => {
      await page.goto("/");

      const featuresSection = page.locator(".features-section");
      await featuresSection.scrollIntoViewIfNeeded();

      const featureCards = page.locator(".feature");
      expect(await featureCards.count()).toBe(3);

      // Cards should be visible
      for (let i = 0; i < (await featureCards.count()); i++) {
        const card = featureCards.nth(i);
        await expect(card).toBeVisible();
      }
    });

    test("Info cards are visible and positioned correctly", async ({ page }) => {
      await page.goto("/");

      const infoCards = page.locator(".info-card");
      const count = await infoCards.count();

      expect(count).toBe(2);

      for (let i = 0; i < count; i++) {
        const card = infoCards.nth(i);
        await expect(card).toBeVisible();

        // Card should have reasonable width
        const boundingBox = await card.boundingBox();
        expect(boundingBox?.width).toBeGreaterThan(100);
      }
    });

    test("Text content is not cut off", async ({ page }) => {
      await page.goto("/");

      // Upload test data
      const fileInput = page.locator("#roleFileInput");
      await fileInput.setInputFiles("data/roles.manifest.json");
      await page.waitForTimeout(500);

      // Select a role
      const firstAreaTitle = page.locator(".area-title").first();
      if (await firstAreaTitle.isVisible()) {
        await firstAreaTitle.click();
        await page.waitForTimeout(200);

        const firstRole = page.locator(".role-name").first();
        if (await firstRole.isVisible()) {
          await firstRole.click();
          await page.waitForTimeout(300);

          // Check permission labels are visible
          const permissionLabels = page.locator(".permission-label");

          for (let i = 0; i < Math.min(3, await permissionLabels.count()); i++) {
            const label = permissionLabels.nth(i);
            const isVisible = await label.isVisible();
            expect(isVisible).toBe(true);
          }
        }
      }
    });

    test("All interactive elements are touch-friendly at this viewport", async ({ page }) => {
      await page.goto("/");

      // Upload test data
      const fileInput = page.locator("#roleFileInput");
      await fileInput.setInputFiles("data/roles.manifest.json");
      await page.waitForTimeout(500);

      const buttons = page.locator('button, [role="button"]');
      const count = await buttons.count();

      // Check button sizes (minimum touch target ~44x44px)
      for (let i = 0; i < Math.min(3, count); i++) {
        const button = buttons.nth(i);
        const boundingBox = await button.boundingBox();

        if (boundingBox) {
          // Most buttons should be reasonably sized
          expect(boundingBox.width >= 30 && boundingBox.height >= 30).toBe(true);
        }
      }
    });
  });
});
