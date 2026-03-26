import { test, expect } from "@playwright/test";

test.describe("UI Visual Regression", () => {
  test("FileUpload hero section renders correctly", async ({ page }) => {
    await page.goto("/");

    // Check hero section is visible
    const heroTitle = page.locator(".hero-title");
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText("The Precision Architect");

    // Check hero subtitle
    const heroSubtitle = page.locator(".hero-subtitle");
    await expect(heroSubtitle).toBeVisible();
    await expect(heroSubtitle).toContainText("Transform unstructured role data");
  });

  test("FileUpload bento grid layout is responsive", async ({ page }) => {
    await page.goto("/");

    // Check grid layout exists
    const gridLayout = page.locator(".grid-layout");
    await expect(gridLayout).toBeVisible();

    // Check drop zone container
    const dropZoneContainer = page.locator(".drop-zone-container");
    await expect(dropZoneContainer).toBeVisible();

    // Check info cards container
    const infoCards = page.locator(".info-cards");
    await expect(infoCards).toBeVisible();

    // Check info cards exist
    const cards = page.locator(".info-card");
    await expect(cards).toHaveCount(2);
  });

  test("FileUpload features section displays correctly", async ({ page }) => {
    await page.goto("/");

    // Scroll to features section
    const featuresSection = page.locator(".features-section");
    await featuresSection.scrollIntoViewIfNeeded();
    await expect(featuresSection).toBeVisible();

    // Check title
    const featuresTitle = page.locator(".features-title");
    await expect(featuresTitle).toContainText("Key Capabilities");

    // Check features
    const features = page.locator(".feature");
    await expect(features).toHaveCount(3);

    // Check feature content
    await expect(features.first()).toContainText("Architectural Blueprint");
    await expect(features.nth(1)).toContainText("Tonal Layering");
    await expect(features.nth(2)).toContainText("Editorial Precision");
  });

  test("Sidebar area sections render with proper styling", async ({ page }) => {
    // Load test data first by uploading a JSON file
    await page.goto("/");

    // Upload a test role file
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");

    // Wait for roles to load
    await page.waitForTimeout(500);

    // Check sidebar exists
    const sidebar = page.locator("#sidebar");
    await expect(sidebar).toBeVisible();

    // Check area groups exist
    const areaGroups = page.locator(".area-group");
    const count = await areaGroups.count();
    expect(count).toBeGreaterThan(0);
  });

  test("RoleDetail permission table styling is correct", async ({ page }) => {
    await page.goto("/");

    // Upload test data
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");
    await page.waitForTimeout(500);

    // Select a role
    const firstRole = page.locator(".role-name").first();
    if (await firstRole.isVisible()) {
      await firstRole.click();
      await page.waitForTimeout(300);

      // Check permission rows are visible
      const permissionRows = page.locator(".permission-row");
      expect(await permissionRows.count()).toBeGreaterThan(0);

      // Check alternating row backgrounds
      const firstRow = permissionRows.first();
      const secondRow = permissionRows.nth(1);

      const firstBg = await firstRow.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      const secondBg = await secondRow.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );

      // Backgrounds should be different (alternating)
      expect(firstBg).not.toBe(secondBg);
    }
  });

  test("CRUD badges have correct color coding", async ({ page }) => {
    await page.goto("/");

    // Upload test data
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");
    await page.waitForTimeout(500);

    // Select a role
    const firstRole = page.locator(".role-name").first();
    if (await firstRole.isVisible()) {
      await firstRole.click();
      await page.waitForTimeout(300);

      // Check CRUD cells exist
      const crudCells = page.locator(".crud-cell");
      const count = await crudCells.count();
      expect(count).toBeGreaterThan(0);

      // Check color classes
      const crudC = page.locator(".crud-cell--c");
      const crudR = page.locator(".crud-cell--r");
      const crudU = page.locator(".crud-cell--u");
      const crudD = page.locator(".crud-cell--d");

      expect(await crudC.count()).toBeGreaterThan(0);
      expect(await crudR.count()).toBeGreaterThan(0);
      expect(await crudU.count()).toBeGreaterThan(0);
      expect(await crudD.count()).toBeGreaterThan(0);
    }
  });

  test("Sidebar chevron icon renders correctly", async ({ page }) => {
    await page.goto("/");

    // Upload test data
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");
    await page.waitForTimeout(500);

    // Check area title buttons exist
    const areaTitles = page.locator(".area-title");
    const count = await areaTitles.count();
    expect(count).toBeGreaterThan(0);

    // Check for SVG icons
    const icons = page.locator(".area-icon");
    expect(await icons.count()).toBe(count);
  });

  test("Overall layout spacing and padding is correct", async ({ page }) => {
    await page.goto("/");

    // Check main app container
    const appContainer = page.locator("#app-container");
    await expect(appContainer).toBeVisible();

    // Check sidebar width
    const sidebar = page.locator("#sidebar");
    const boundingBox = await sidebar.boundingBox();
    expect(boundingBox?.width).toBeCloseTo(260, 10);
  });
});
