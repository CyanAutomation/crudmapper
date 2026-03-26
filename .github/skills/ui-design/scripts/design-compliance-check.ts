#!/usr/bin/env node

/**
 * Design Compliance Check
 *
 * Validates UI design system compliance using Playwright.
 * Tests design tokens, visual structure, typography, accessibility, and more.
 */

import { chromium } from "@playwright/test";
import type { Browser, Page } from "@playwright/test";

interface Result {
  passed: boolean;
  checks?: Record<string, unknown>;
  tokens?: Record<string, string>;
  error?: string;
}

interface Results {
  timestamp: string;
  url: string;
  tests: Record<string, Result>;
}

// Parse CLI arguments
const args = process.argv.slice(2);
let outputFormat = "readable";
let targetURL = "http://localhost:8000";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--format" && args[i + 1]) {
    outputFormat = args[i + 1];
  }
  if (args[i] === "--url" && args[i + 1]) {
    targetURL = args[i + 1];
  }
}

const results: Results = {
  timestamp: new Date().toISOString(),
  url: targetURL,
  tests: {},
};

async function testPageStructure(page: Page): Promise<Result> {
  const result: Result = {
    passed: true,
    checks: {},
  };

  try {
    const header = await page
      .locator("header")
      .first()
      .isVisible()
      .catch(() => false);
    (result.checks as Record<string, unknown>).headerVisible = header;

    const main = await page
      .locator("main")
      .first()
      .isVisible()
      .catch(() => false);
    (result.checks as Record<string, unknown>).mainContentVisible = main;

    const sidebar = await page
      .locator('[role="navigation"], aside, .sidebar')
      .first()
      .isVisible()
      .catch(() => false);
    (result.checks as Record<string, unknown>).sidebarVisible = sidebar;

    result.passed = (header && main) as boolean;
  } catch (error) {
    result.passed = false;
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

async function testDesignTokens(page: Page): Promise<Result> {
  const result: Result = {
    passed: true,
    tokens: {},
  };

  const cssVariables = [
    "--color-primary",
    "--color-surface",
    "--color-secondary",
    "--color-accent",
    "--spacing-base",
    "--border-radius",
  ];

  try {
    const computedTokens = await page.evaluate<Record<string, string>>((vars) => {
      const root = getComputedStyle(document.documentElement);
      const tokens: Record<string, string> = {};
      vars.forEach((v) => {
        tokens[v] = root.getPropertyValue(v).trim();
      });
      return tokens;
    }, cssVariables);

    result.tokens = computedTokens;
    result.passed = !!computedTokens["--color-primary"];
  } catch (error) {
    result.passed = false;
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

async function testTypography(page: Page): Promise<Result> {
  const result: Result = {
    passed: true,
    checks: {},
  };

  try {
    const hasInterFont = await page
      .evaluate(() => {
        const style = getComputedStyle(document.body);
        return style.fontFamily.includes("Inter");
      })
      .catch(() => false);

    (result.checks as Record<string, unknown>).interFontLoaded = hasInterFont;

    const hasMonoFont = await page
      .evaluate(() => {
        const monospaceElements = document.querySelectorAll('code, pre, [class*="mono"]');
        if (monospaceElements.length === 0) return false;
        const style = getComputedStyle(monospaceElements[0]);
        return style.fontFamily.includes("JetBrains") || style.fontFamily.includes("monospace");
      })
      .catch(() => false);

    (result.checks as Record<string, unknown>).monoFontPresent = hasMonoFont;

    const headings = await page.evaluate(() => {
      const h1s = document.querySelectorAll("h1").length;
      const h2s = document.querySelectorAll("h2").length;
      const h3s = document.querySelectorAll("h3").length;
      return { h1s, h2s, h3s };
    });

    (result.checks as Record<string, unknown>).headingHierarchy = headings;
    result.passed = hasInterFont as boolean;
  } catch (error) {
    result.passed = false;
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

async function testInteractiveElements(page: Page): Promise<Result> {
  const result: Result = {
    passed: true,
    checks: {},
  };

  try {
    const counts = await page.evaluate(() => {
      return {
        buttons: document.querySelectorAll("button").length,
        inputs: document.querySelectorAll("input").length,
        links: document.querySelectorAll("a").length,
        forms: document.querySelectorAll("form").length,
        selects: document.querySelectorAll("select").length,
      };
    });

    (result.checks as Record<string, unknown>).elements = counts;
    result.passed = counts.buttons > 0 || counts.inputs > 0;
  } catch (error) {
    result.passed = false;
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

async function testAccessibility(page: Page): Promise<Result> {
  const result: Result = {
    passed: true,
    checks: {},
  };

  try {
    const a11yMetrics = await page.evaluate(() => {
      return {
        headings: document.querySelectorAll("h1, h2, h3, h4, h5, h6").length,
        labels: document.querySelectorAll("label").length,
        ariaLabels: document.querySelectorAll("[aria-label]").length,
        ariaHidden: document.querySelectorAll("[aria-hidden]").length,
        buttons: document.querySelectorAll("button").length,
      };
    });

    (result.checks as Record<string, unknown>).a11y = a11yMetrics;
    result.passed = a11yMetrics.headings > 0;
  } catch (error) {
    result.passed = false;
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

async function runCompliance(): Promise<void> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch();
    const context = await browser.createContext();
    const page = await context.newPage();

    await page.goto(targetURL);

    console.log(`\n🎨 Design Compliance Check - ${new Date().toLocaleString()}`);
    console.log("═".repeat(60));

    console.log("\n📋 Running compliance tests...\n");

    results.tests.pageStructure = await testPageStructure(page);
    console.log(`✓ Page Structure: ${results.tests.pageStructure.passed ? "PASS" : "FAIL"}`);

    results.tests.designTokens = await testDesignTokens(page);
    console.log(`✓ Design Tokens: ${results.tests.designTokens.passed ? "PASS" : "FAIL"}`);

    results.tests.typography = await testTypography(page);
    console.log(`✓ Typography: ${results.tests.typography.passed ? "PASS" : "FAIL"}`);

    results.tests.interactive = await testInteractiveElements(page);
    console.log(`✓ Interactive Elements: ${results.tests.interactive.passed ? "PASS" : "FAIL"}`);

    results.tests.accessibility = await testAccessibility(page);
    console.log(`✓ Accessibility: ${results.tests.accessibility.passed ? "PASS" : "FAIL"}`);

    const allPassed = Object.values(results.tests).every((t) => t.passed);

    console.log("\n" + "═".repeat(60));
    console.log(`\n${allPassed ? "✅ All compliance checks passed!" : "❌ Some checks failed"}`);
    console.log(`\nResults saved for ${results.url}\n`);

    if (outputFormat === "json") {
      console.log(JSON.stringify(results, null, 2));
    }

    await context.close();
  } catch (error) {
    console.error(
      "Compliance check failed:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runCompliance();
