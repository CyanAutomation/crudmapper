import { Page } from "@playwright/test";

/**
 * Test utilities and helpers for UI testing
 */

export class UITestUtils {
  constructor(private page: Page) {}

  /**
   * Upload a role file using the file input
   */
  async uploadRoleFile(filePath: string): Promise<void> {
    const fileInput = this.page.locator("#roleFileInput");
    await fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(500);
  }

  /**
   * Drag and drop a file onto the drop zone
   */
  async dragDropRoleFile(filePath: string): Promise<void> {
    const dropZone = this.page.locator("#roleDropZone");
    await dropZone.dragAndDropFile(filePath);
    await this.page.waitForTimeout(500);
  }

  /**
   * Expand an area by index
   */
  async expandArea(index: number = 0): Promise<void> {
    const areaTitles = this.page.locator(".area-title");
    await areaTitles.nth(index).click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Collapse an area by index
   */
  async collapseArea(index: number = 0): Promise<void> {
    const areaTitles = this.page.locator(".area-title");
    const button = areaTitles.nth(index);

    // Check if expanded
    const isExpanded = (await button.getAttribute("aria-expanded")) === "true";
    if (isExpanded) {
      await button.click();
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Select a role by index
   */
  async selectRole(index: number = 0): Promise<string> {
    const roles = this.page.locator(".role-name");
    const roleName = await roles.nth(index).textContent();
    await roles.nth(index).click();
    await this.page.waitForTimeout(300);

    return roleName || "";
  }

  /**
   * Get the name of the currently selected role
   */
  async getSelectedRoleName(): Promise<string> {
    const selectedRole = this.page.locator(".role-name.is-selected");
    return (await selectedRole.first().textContent()) || "";
  }

  /**
   * Search permissions by filter text
   */
  async searchPermissions(text: string): Promise<void> {
    const searchInput = this.page.locator("#permSearch");
    await searchInput.fill(text);
    await this.page.waitForTimeout(300);
  }

  /**
   * Clear permission search
   */
  async clearSearch(): Promise<void> {
    const searchInput = this.page.locator("#permSearch");
    await searchInput.clear();
    await this.page.waitForTimeout(200);
  }

  /**
   * Get count of visible permission rows
   */
  async getPermissionRowCount(): Promise<number> {
    const rows = this.page.locator(".permission-row");
    return await rows.count();
  }

  /**
   * Get count of enabled CRUD cells of a specific type
   */
  async getEnabledCrudCount(type: "c" | "r" | "u" | "d"): Promise<number> {
    const cells = this.page.locator(`.crud-cell--${type}.enabled`);
    return await cells.count();
  }

  /**
   * Check if a specific CRUD type has any enabled cells
   */
  async hasCrudPermissions(type: "c" | "r" | "u" | "d"): Promise<boolean> {
    const count = await this.getEnabledCrudCount(type);
    return count > 0;
  }

  /**
   * Get all area names in the sidebar
   */
  async getAreaNames(): Promise<string[]> {
    const areaTitles = this.page.locator(".area-title");
    const count = await areaTitles.count();
    const names: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await areaTitles.nth(i).locator(".area-name").textContent();
      if (text) names.push(text.trim());
    }

    return names;
  }

  /**
   * Get role count for an area by index
   */
  async getAreaRoleCount(areaIndex: number = 0): Promise<number> {
    const areaTitles = this.page.locator(".area-title");
    const count = await areaTitles.nth(areaIndex).locator(".role-count").textContent();
    return count ? parseInt(count.trim()) : 0;
  }

  /**
   * Get all role names in an area (area must be expanded)
   */
  async getAreaRoleNames(areaIndex: number = 0): Promise<string[]> {
    // First make sure area is expanded
    const areaTitles = this.page.locator(".area-title");
    const isExpanded = (await areaTitles.nth(areaIndex).getAttribute("aria-expanded")) === "true";

    if (!isExpanded) {
      await this.expandArea(areaIndex);
    }

    const rolesList = this.page.locator(".roles-list").nth(areaIndex);
    const roles = rolesList.locator(".role-name");
    const count = await roles.count();
    const names: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await roles.nth(i).textContent();
      if (text) names.push(text.trim());
    }

    return names;
  }

  /**
   * Check if a role is currently selected
   */
  async isRoleSelected(roleIndex: number): Promise<boolean> {
    const roles = this.page.locator(".role-name");
    const classes = await roles.nth(roleIndex).getAttribute("class");
    return classes?.includes("is-selected") || false;
  }

  /**
   * Get all feature titles
   */
  async getFeatureTitles(): Promise<string[]> {
    const features = this.page.locator(".feature h4");
    const count = await features.count();
    const titles: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await features.nth(i).textContent();
      if (text) titles.push(text.trim());
    }

    return titles;
  }

  /**
   * Check if hero section is visible
   */
  async isHeroVisible(): Promise<boolean> {
    const hero = this.page.locator(".hero-section");
    return await hero.isVisible();
  }

  /**
   * Check if features section is visible
   */
  async isFeaturesVisible(): Promise<boolean> {
    const features = this.page.locator(".features-section");
    return await features.isVisible();
  }

  /**
   * Get role header information
   */
  async getRoleHeaderInfo(): Promise<{
    name: string;
    roleId: string;
    area: string;
  }> {
    const header = this.page.locator(".role-header");
    const name = await header.locator("h2").textContent();

    // Get metadata values
    const metaValues = await header.locator(".role-meta-value").textContent();
    const lines =
      metaValues
        ?.split("\n")
        .map((l) => l.trim())
        .filter((l) => l) || [];

    return {
      name: (name || "").trim(),
      roleId: lines[0] || "",
      area: lines[1] || "",
    };
  }

  /**
   * Wait for sidebar to be populated with roles
   */
  async waitForRolesLoaded(): Promise<number> {
    await this.page.waitForSelector(".area-group", { timeout: 5000 });

    const groups = this.page.locator(".area-group");
    return await groups.count();
  }

  /**
   * Perform complete workflow: upload, expand, select, verify
   */
  async completeWorkflow(
    filePath: string,
    areaIndex: number = 0,
    roleIndex: number = 0
  ): Promise<{
    areaCount: number;
    selectedRoleName: string;
  }> {
    await this.uploadRoleFile(filePath);
    const areaCount = await this.waitForRolesLoaded();

    await this.expandArea(areaIndex);
    const selectedRoleName = await this.selectRole(roleIndex);

    return { areaCount, selectedRoleName };
  }
}

/**
 * Create a UI test utils instance for the current page
 */
export function createTestUtils(page: Page): UITestUtils {
  return new UITestUtils(page);
}
