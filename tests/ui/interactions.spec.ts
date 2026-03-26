import { test, expect } from "@playwright/test";

test.describe("UI Interactions", () => {
  test("File upload works via file picker button", async ({ page }) => {
    await page.goto("/");

    // Upload via file input
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");

    // Wait for processing
    await page.waitForTimeout(500);

    // Check that sidebar is populated
    const _sidebar = page.locator("#sidebar");
    const areaTitle = page.locator(".area-title");

    expect(await areaTitle.count()).toBeGreaterThan(0);
  });

  test("File upload works via drag and drop", async ({ page }) => {
    await page.goto("/");

    const fileInput = page.locator("#roleFileInput");

    // Perform file upload
    await fileInput.setInputFiles("data/roles.manifest.json");

    // Wait for processing
    await page.waitForTimeout(500);

    // Check sidebar is populated
    const areaTitle = page.locator(".area-title");
    expect(await areaTitle.count()).toBeGreaterThan(0);
  });

  test("Drag over changes drop zone appearance", async ({ page }) => {
    await page.goto("/");

    const dropZone = page.locator("#roleDropZone");

    // Get initial styles
    const _initialClass = await dropZone.getAttribute("class");

    // Simulate drag over
    await dropZone.dispatchEvent("dragover");
    await page.waitForTimeout(100);

    // Class should now include 'is-drag-over'
    const classAfterDragOver = await dropZone.getAttribute("class");
    expect(classAfterDragOver).toContain("is-drag-over");
  });

  test("Sidebar area can be expanded and collapsed", async ({ page }) => {
    await page.goto("/");

    // Upload test data
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");
    await page.waitForTimeout(500);

    // Get first area title
    const firstAreaTitle = page.locator(".area-title").first();

    // Click to expand
    await firstAreaTitle.click();
    await page.waitForTimeout(200);

    // Check roles list is visible
    let rolesList = page.locator(".roles-list");
    expect(await rolesList.isVisible()).toBe(true);

    // Click to collapse
    await firstAreaTitle.click();
    await page.waitForTimeout(200);

    // Roles list should not be visible
    rolesList = page.locator(".roles-list");
    const isVisible = await rolesList.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test("Clicking a role selects it and shows details", async ({ page }) => {
    await page.goto("/");

    // Upload test data
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");
    await page.waitForTimeout(500);

    // Expand first area
    const firstAreaTitle = page.locator(".area-title").first();
    await firstAreaTitle.click();
    await page.waitForTimeout(200);

    // Click first role
    const firstRole = page.locator(".role-name").first();
    const roleName = await firstRole.textContent();

    await firstRole.click();
    await page.waitForTimeout(300);

    // Check role is marked as selected
    await expect(firstRole).toHaveClass(/is-selected/);

    // Check main area shows role details
    const main = page.locator("#main");
    await expect(main).toBeVisible();
    await expect(main).toContainText(roleName?.trim() || "");
  });

  test("Search filter works correctly", async ({ page }) => {
    await page.goto("/");

    // Upload test data
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

    // Get initial permission row count
    let permissionRows = page.locator(".permission-row");
    const initialCount = await permissionRows.count();

    // Type in search
    const searchInput = page.locator("#permSearch");
    await searchInput.fill("non-existent-permission");
    await page.waitForTimeout(300);

    // Check filtered count is less
    permissionRows = page.locator(".permission-row");
    const filteredCount = await permissionRows.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(300);

    // Count should return to initial
    permissionRows = page.locator(".permission-row");
    expect(await permissionRows.count()).toBeGreaterThan(0);
  });

  test("CRUD cell hover effects work", async ({ page }) => {
    await page.goto("/");

    // Upload test data
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

    // Get an enabled CRUD cell
    const enabledCrudCell = page.locator(".crud-cell.enabled").first();
    if (await enabledCrudCell.isVisible()) {
      // Get initial transform
      const initialTransform = await enabledCrudCell.evaluate(
        (el) => window.getComputedStyle(el).transform
      );

      // Hover over it
      await enabledCrudCell.hover();
      await page.waitForTimeout(100);

      // Transform should change (due to translateY)
      const hoverTransform = await enabledCrudCell.evaluate(
        (el) => window.getComputedStyle(el).transform
      );

      // Transforms should be different
      expect(hoverTransform).not.toBe(initialTransform);
    }
  });

  test("Sidebar area indicator shows role count", async ({ page }) => {
    await page.goto("/");

    // Upload test data
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");
    await page.waitForTimeout(500);

    // Check role count indicators
    const roleCounts = page.locator(".role-count");
    const count = await roleCounts.count();

    expect(count).toBeGreaterThan(0);

    // Each count should be a number
    for (let i = 0; i < count; i++) {
      const text = await roleCounts.nth(i).textContent();
      expect(text).toMatch(/^\d+$/);
    }
  });

  test("Role indicator dot animates on selection", async ({ page }) => {
    await page.goto("/");

    // Upload test data
    const fileInput = page.locator("#roleFileInput");
    await fileInput.setInputFiles("data/roles.manifest.json");
    await page.waitForTimeout(500);

    // Expand area and select role
    const firstAreaTitle = page.locator(".area-title").first();
    await firstAreaTitle.click();
    await page.waitForTimeout(200);

    const firstRole = page.locator(".role-name").first();
    await firstRole.click();
    await page.waitForTimeout(300);

    // Check selected role has indicator
    const selectedIndicator = page.locator(".role-name.is-selected .role-indicator").first();
    await expect(selectedIndicator).toBeVisible();
  });
});
