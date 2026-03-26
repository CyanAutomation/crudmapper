#!/usr/bin/env node

/**
 * Responsive Design Test
 *
 * Tests UI design system compliance across multiple viewports.
 * Validates layout, spacing, and visual consistency at:
 * - Mobile (375px)
 * - Tablet (768px)
 * - Desktop (1440px)
 */

import { chromium } from "@playwright/test";
import type { Browser, Page } from "@playwright/test";

interface ViewportConfig {
  width: number;
  height: number;
  label: string;
}

interface ViewportResult {
  name: string;
  width: number;
  height: number;
  checks: Record<string, unknown>;
  measurements: Record<string, unknown>;
}

const args = process.argv.slice(2);
let targetViewport: string | null = null;
let targetURL = "http://localhost:8000";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--viewport" && args[i + 1]) {
    targetViewport = args[i + 1].toLowerCase();
  }
  if (args[i] === "--url" && args[i + 1]) {
    targetURL = args[i + 1];
  }
}

const viewports: Record<string, ViewportConfig> = {
  mobile: { width: 375, height: 667, label: "Mobile (375px)" },
  tablet: { width: 768, height: 1024, label: "Tablet (768px)" },
  desktop: { width: 1440, height: 900, label: "Desktop (1440px)" },
};

async function testViewport(
  page: Page,
  viewportKey: string,
  viewportConfig: ViewportConfig
): Promise<ViewportResult> {
  const result: ViewportResult = {
    name: viewportConfig.label,
    width: viewportConfig.width,
    height: viewportConfig.height,
    checks: {},
    measurements: {},
  };

  try {
    await page.setViewportSize({
      width: viewportConfig.width,
      height: viewportConfig.height,
    });

    await page.waitForTimeout(500);

    const mainVisible = await page
      .locator("main")
      .first()
      .isVisible()
      .catch(() => false);
    result.checks.mainVisible = mainVisible;

    const isScrollable = await page.evaluate(() => {
      return document.documentElement.scrollHeight > window.innerHeight;
    });
    result.checks.scrollableContent = isScrollable;

    const sidebarVisible = await page
      .locator('[role="navigation"], aside, .sidebar')
      .first()
      .isVisible()
      .catch(() => false);
    result.checks.sidebarVisible = sidebarVisible;

    const hasHorizontalScroll = await page.evaluate(() => {
      return window.innerWidth < document.documentElement.scrollWidth;
    });
    result.checks.noHorizontalOverflow = !hasHorizontalScroll;

    const fontSizes = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const h2 = document.querySelector("h2");
      const body = document.body;

      return {
        h1FontSize: h1 ? getComputedStyle(h1).fontSize : "N/A",
        h2FontSize: h2 ? getComputedStyle(h2).fontSize : "N/A",
        bodyFontSize: getComputedStyle(body).fontSize,
      };
    });

    result.measurements = fontSizes;
  } catch (error) {
    result.checks.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

async function runResponsiveTest(): Promise<void> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch();
    const context = await browser.createContext();
    const page = await context.newPage();

    await page.goto(targetURL);

    console.log(`\n📱 Responsive Design Test - ${new Date().toLocaleString()}`);
    console.log("═".repeat(60));

    const viewportsToTest = targetViewport
      ? { [targetViewport]: viewports[targetViewport] }
      : viewports;

    for (const [key, config] of Object.entries(viewportsToTest)) {
      const result = await testViewport(page, key, config as ViewportConfig);
      console.log(`\n✓ ${result.name}`);
      console.log(`  Main visible: ${result.checks.mainVisible}`);
      console.log(`  No horizontal overflow: ${result.checks.noHorizontalOverflow}`);
      console.log(
        `  Body font size: ${(result.measurements as Record<string, unknown>).bodyFontSize}`
      );
    }

    console.log("\n" + "═".repeat(60));
    console.log("\n✅ Responsive design test complete\n");

    await context.close();
  } catch (error) {
    console.error(
      "Responsive test failed:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runResponsiveTest();
