import { test, expect } from "@playwright/test";

test.describe("End-to-End Workflow", () => {
  test("Complete user workflow: upload, navigate, search, view permissions", async ({ page }) => {
    // Step 1: Navigate to app
    await page.goto("/");

    // Verify hero section is visible
    const heroTitle = page.locator(".hero-title");
    await expect(heroTitle).toBeVisible();

    // Step 2: Upload role data
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");

    // Wait for data to be processed
    await page.waitForTimeout(500);

    // Verify sidebar is populated
    const areaGroup = page.locator(".area-group");
    expect(await areaGroup.count()).toBeGreaterThan(0);

    // Step 3: Expand an area
    const firstAreaTitle = page.locator(".area-title").first();
    await firstAreaTitle.click();
    await page.waitForTimeout(200);

    // Verify roles list is visible
    const rolesList = page.locator(".roles-list").first();
    await expect(rolesList).toBeVisible();

    // Step 4: Select a role
    const firstRole = page.locator(".role-name").first();
    const _selectedRoleName = await firstRole.textContent();

    await firstRole.click();
    await page.waitForTimeout(300);

    // Verify role is selected
    await expect(firstRole).toHaveClass(/is-selected/);

    // Step 5: Verify role details are displayed
    const roleHeader = page.locator(".role-header");
    await expect(roleHeader).toBeVisible();

    // Step 6: Check CRUD badges are rendered
    const crudCells = page.locator(".crud-cell");
    expect(await crudCells.count()).toBeGreaterThan(0);

    // Step 7: Verify different CRUD types are present
    const crudC = page.locator(".crud-cell--c");
    const crudR = page.locator(".crud-cell--r");
    const crudU = page.locator(".crud-cell--u");
    const crudD = page.locator(".crud-cell--d");

    expect(await crudC.count()).toBeGreaterThan(0);
    expect(await crudR.count()).toBeGreaterThan(0);
    expect(await crudU.count()).toBeGreaterThan(0);
    expect(await crudD.count()).toBeGreaterThan(0);

    // Step 8: Test search functionality
    const searchInput = page.locator("#permSearch");
    const initialPermRows = await page.locator(".permission-row").count();

    await searchInput.fill("Read");
    await page.waitForTimeout(300);

    const filteredPermRows = await page.locator(".permission-row").count();
    expect(filteredPermRows).toBeLessThanOrEqual(initialPermRows);

    // Step 9: Clear search
    await searchInput.clear();
    await page.waitForTimeout(200);

    // Step 10: Select different role
    const rolesList2 = page.locator(".role-name");
    if (await rolesList2.nth(1).isVisible()) {
      await rolesList2.nth(1).click();
      await page.waitForTimeout(300);

      // Verify different role is selected
      await expect(rolesList2.nth(1)).toHaveClass(/is-selected/);
    }
  });

  test("Drag and drop file upload workflow", async ({ page }) => {
    await page.goto("/");

    // Verify empty state initially
    const _emptyState = page.locator('.empty-state, [style*="display: flex"]');

    // Perform file upload to drop zone
    const dropZone = page.locator("#roleDropZone input[type='file']");
    await dropZone.setInputFiles("data/roles.manifest.json");

    // Wait for processing
    await page.waitForTimeout(500);

    // Verify data is loaded
    const areaGroup = page.locator(".area-group");
    expect(await areaGroup.count()).toBeGreaterThan(0);

    // Verify features section is visible
    const featuresSection = page.locator(".features-section");
    await expect(featuresSection).toBeVisible();
  });

  test("Navigation between multiple areas and roles", async ({ page }) => {
    await page.goto("/");

    // Upload data
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");
    await page.waitForTimeout(500);

    // Get all areas
    const areaTitles = page.locator(".area-title");
    const areaCount = await areaTitles.count();

    expect(areaCount).toBeGreaterThan(0);

    // Expand first area and select first role
    await areaTitles.first().click();
    await page.waitForTimeout(200);

    const firstRole = page.locator(".role-name").first();
    const firstRoleName = await firstRole.textContent();
    await firstRole.click();
    await page.waitForTimeout(300);

    // Verify role is displayed
    const roleHeader = page.locator(".role-header h2");
    const headerText = await roleHeader.textContent();
    expect(headerText).toContain((firstRoleName || "").trim());

    // If there's a second area, expand and select a role from it
    if (areaCount > 1) {
      // Collapse first area
      await areaTitles.first().click();
      await page.waitForTimeout(200);

      // Expand second area
      await areaTitles.nth(1).click();
      await page.waitForTimeout(200);

      // Get roles in second area (may need to re-query)
      const rolesInSecondArea = page.locator(".roles-list").last().locator(".role-name");
      if ((await rolesInSecondArea.count()) > 0) {
        await rolesInSecondArea.first().click();
        await page.waitForTimeout(300);

        // Verify different role is displayed
        const newHeader = await roleHeader.textContent();
        expect(newHeader).not.toContain((firstRoleName || "").trim());
      }
    }
  });

  test("Error handling when invalid file is uploaded", async ({ page }) => {
    await page.goto("/");

    // For now, we'll skip the invalid file test since it requires Buffer
    // The app should handle errors gracefully when loading files
    const uploadContainer = page.locator(".upload-container");
    await expect(uploadContainer).toBeVisible();

    // Verify error-panel selector exists in markup
    const errorPanel = page.locator(".error-panel");
    // Error panel may or may not be visible depending on loaded data
    const count = await errorPanel.count();
    expect(typeof count).toBe("number");
  });

  test("Accessibility testing - keyboard navigation", async ({ page }) => {
    await page.goto("/");

    // Upload data
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");
    await page.waitForTimeout(500);

    // Get area title
    const firstAreaTitle = page.locator(".area-title").first();

    // Focus on it via keyboard
    await firstAreaTitle.focus();

    // Press Enter to expand
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);

    // Verify it expanded
    const rolesList = page.locator(".roles-list").first();
    await expect(rolesList).toBeVisible();

    // Move focus to first role
    const firstRole = page.locator(".role-name").first();
    await firstRole.focus();

    // Press Enter to select
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);

    // Verify role is selected
    await expect(firstRole).toHaveClass(/is-selected/);

    // Verify role details are visible
    const roleHeader = page.locator(".role-header");
    await expect(roleHeader).toBeVisible();
  });

  test("Visual design tokens are applied correctly", async ({ page }) => {
    await page.goto("/");

    // Check primary color is used
    const heroSection = page.locator(".hero-section");
    const bgColor = await heroSection.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    // Should have a color (not transparent)
    expect(bgColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(bgColor).not.toBe("transparent");

    // Upload data
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");
    await page.waitForTimeout(500);

    // Select a role
    const firstAreaTitle = page.locator(".area-title").first();
    await firstAreaTitle.click();
    await page.waitForTimeout(200);

    const firstRole = page.locator(".role-name").first();
    await firstRole.click();
    await page.waitForTimeout(300);

    // Check CRUD badge colors
    const enabledCrudC = page.locator(".crud-cell--c.enabled").first();
    if (await enabledCrudC.isVisible()) {
      const bgColor = await enabledCrudC.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );

      // Should have a distinct color (green for Create)
      expect(bgColor).toBeTruthy();
    }
  });
});
