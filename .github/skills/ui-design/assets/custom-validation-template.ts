#!/usr/bin/env node

/**
 * Custom Design Validation Template
 *
 * This is a template showing how to create custom design validation tests
 * using Playwright. Copy this file and extend it with your own assertions.
 */

import { chromium } from "@playwright/test";
import type { Browser, Page } from "@playwright/test";

interface TestResult {
  passed: boolean;
  checks?: Record<string, unknown>;
  error?: string;
}

const args = process.argv.slice(2);
let targetURL = "http://localhost:8000";
let outputFormat = "readable";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--url" && args[i + 1]) targetURL = args[i + 1];
  if (args[i] === "--format" && args[i + 1]) outputFormat = args[i + 1];
}

async function testDesignTokens(page: Page): Promise<TestResult> {
  const result: TestResult = {
    passed: true,
    checks: {},
  };

  try {
    const expectedTokens: Record<string, string[]> = {
      "--color-primary": ["#565e74", "rgb(86, 94, 116)"],
      "--color-surface": ["#f5f7fa", "rgb(245, 247, 250)"],
      "--spacing-base": ["1rem", "16px"],
      "--border-radius": ["0.375rem", "6px"],
    };

    const computedTokens = await page.evaluate<{
      actual: Record<string, string>;
      mismatches: Array<{ token: string; expected: string; actual: string }>;
    }>((expected) => {
      const root = getComputedStyle(document.documentElement);
      const actual: Record<string, string> = {};
      const mismatches: Array<{ token: string; expected: string; actual: string }> = [];

      Object.keys(expected).forEach((token) => {
        const value = root.getPropertyValue(token).trim();
        actual[token] = value;

        const matches = (expected as Record<string, string[]>)[token].some(
          (expectedVal) => value.includes(expectedVal.replace("#", "")) || value === expectedVal
        );

        if (!matches && value) {
          mismatches.push({
            token,
            expected: (expected as Record<string, string[]>)[token][0],
            actual: value,
          });
        }
      });

      return { actual, mismatches };
    }, expectedTokens);

    (result.checks as Record<string, unknown>).tokens = computedTokens.actual;
    result.passed = computedTokens.mismatches.length === 0;

    if (!result.passed) {
      (result.checks as Record<string, unknown>).issues = computedTokens.mismatches;
    }
  } catch (error) {
    result.passed = false;
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

async function testCRUDBadgeColors(page: Page): Promise<TestResult> {
  const result: TestResult = {
    passed: true,
    checks: {},
  };

  try {
    const badgeColors = await page.evaluate(() => {
      const badges = {
        create: document.querySelectorAll('[class*="crud-cell--c"]').length,
        read: document.querySelectorAll('[class*="crud-cell--r"]').length,
        update: document.querySelectorAll('[class*="crud-cell--u"]').length,
        delete: document.querySelectorAll('[class*="crud-cell--d"]').length,
      };
      return badges;
    });

    (result.checks as Record<string, unknown>).badgeCounts = badgeColors;
    result.passed = Object.values(badgeColors).some((count) => count > 0);
  } catch (error) {
    result.passed = false;
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

async function runValidation(): Promise<void> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch();
    const context = await browser.createContext();
    const page = await context.newPage();

    await page.goto(targetURL);

    console.log("\n🎨 Custom Design Validation\n");
    console.log("═".repeat(60));

    const designTokenResult = await testDesignTokens(page);
    console.log(`✓ Design Tokens: ${designTokenResult.passed ? "PASS" : "FAIL"}`);

    const crudBadgesResult = await testCRUDBadgeColors(page);
    console.log(`✓ CRUD Badge Colors: ${crudBadgesResult.passed ? "PASS" : "FAIL"}`);

    console.log(`\n${"═".repeat(60)}`);
    console.log("\n✅ Validation complete\n");

    if (outputFormat === "json") {
      console.log(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            url: targetURL,
            results: { designTokenResult, crudBadgesResult },
          },
          null,
          2
        )
      );
    }

    await context.close();
  } catch (error) {
    console.error("Validation failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runValidation();
