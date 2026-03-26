#!/usr/bin/env node

/**
 * Design Compliance Check
 * 
 * Validates UI design system compliance using Playwright.
 * Tests design tokens, visual structure, typography, accessibility, and more.
 * 
 * Based on the existing ui-assessment.js but optimized for agent automation.
 * 
 * Usage:
 *   node design-compliance-check.js [--format json|readable] [--url <url>]
 */

import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI arguments
const args = process.argv.slice(2);
let outputFormat = 'readable';
let targetURL = 'http://localhost:8000';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--format' && args[i + 1]) {
    outputFormat = args[i + 1];
  }
  if (args[i] === '--url' && args[i + 1]) {
    targetURL = args[i + 1];
  }
}

const results = {
  timestamp: new Date().toISOString(),
  url: targetURL,
  tests: {}
};

/**
 * Validate page load and basic structure
 */
async function testPageStructure(page) {
  const result = {
    passed: true,
    checks: {}
  };

  try {
    // Check header visibility
    const header = await page.locator('header').first().isVisible().catch(() => false);
    result.checks.headerVisible = header;

    // Check main content
    const main = await page.locator('main').first().isVisible().catch(() => false);
    result.checks.mainContentVisible = main;

    // Check for sidebar (role-list or navigation)
    const sidebar = await page.locator('[role="navigation"], aside, .sidebar').first().isVisible().catch(() => false);
    result.checks.sidebarVisible = sidebar;

    result.passed = header && main;
  } catch (error) {
    result.passed = false;
    result.error = error.message;
  }

  return result;
}

/**
 * Validate design tokens (CSS variables)
 */
async function testDesignTokens(page) {
  const result = {
    passed: true,
    tokens: {}
  };

  const cssVariables = [
    '--color-primary',
    '--color-surface',
    '--color-secondary',
    '--color-accent',
    '--spacing-base',
    '--border-radius'
  ];

  try {
    const computedTokens = await page.evaluate((vars) => {
      const root = getComputedStyle(document.documentElement);
      const tokens = {};
      vars.forEach(v => {
        tokens[v] = root.getPropertyValue(v).trim();
      });
      return tokens;
    }, cssVariables);

    result.tokens = computedTokens;
    // Check that primary colors are defined
    result.passed = !!computedTokens['--color-primary'];
  } catch (error) {
    result.passed = false;
    result.error = error.message;
  }

  return result;
}

/**
 * Validate typography
 */
async function testTypography(page) {
  const result = {
    passed: true,
    checks: {}
  };

  try {
    // Check for Inter font (UI typography)
    const hasInterFont = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return style.fontFamily.includes('Inter');
    }).catch(() => false);

    result.checks.interFontLoaded = hasInterFont;

    // Check for JetBrains Mono (monospace)
    const hasMonoFont = await page.evaluate(() => {
      const monospaceElements = document.querySelectorAll('code, pre, [class*="mono"]');
      if (monospaceElements.length === 0) return false;
      const style = getComputedStyle(monospaceElements[0]);
      return style.fontFamily.includes('JetBrains') || style.fontFamily.includes('monospace');
    }).catch(() => false);

    result.checks.monoFontPresent = hasMonoFont;

    // Heading hierarchy
    const headings = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1').length;
      const h2s = document.querySelectorAll('h2').length;
      const h3s = document.querySelectorAll('h3').length;
      return { h1s, h2s, h3s };
    });

    result.checks.headingHierarchy = headings;
    result.passed = hasInterFont;
  } catch (error) {
    result.passed = false;
    result.error = error.message;
  }

  return result;
}

/**
 * Validate interactive elements
 */
async function testInteractiveElements(page) {
  const result = {
    passed: true,
    elements: {}
  };

  try {
    const counts = await page.evaluate(() => {
      return {
        buttons: document.querySelectorAll('button').length,
        inputs: document.querySelectorAll('input').length,
        links: document.querySelectorAll('a').length,
        forms: document.querySelectorAll('form').length,
        selects: document.querySelectorAll('select').length
      };
    });

    result.elements = counts;
    result.passed = counts.buttons > 0 || counts.inputs > 0;
  } catch (error) {
    result.passed = false;
    result.error = error.message;
  }

  return result;
}

/**
 * Validate accessibility
 */
async function testAccessibility(page) {
  const result = {
    passed: true,
    checks: {}
  };

  try {
    const a11y = await page.evaluate(() => {
      const issues = [];
      const report = {
        untaggedInputs: 0,
        untaggedButtons: 0,
        formLabels: 0,
        ariaLabels: 0
      };

      // Check for labeled inputs
      document.querySelectorAll('input').forEach(input => {
        const id = input.getAttribute('id');
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.hasAttribute('aria-label');
        if (!hasLabel && !hasAriaLabel) {
          report.untaggedInputs++;
        }
        if (hasLabel) report.formLabels++;
        if (hasAriaLabel) report.ariaLabels++;
      });

      // Check buttons for text or aria-label
      document.querySelectorAll('button').forEach(btn => {
        const hasText = btn.textContent.trim().length > 0;
        const hasAriaLabel = btn.hasAttribute('aria-label');
        if (!hasText && !hasAriaLabel) {
          report.untaggedButtons++;
        }
      });

      return report;
    });

    result.checks = a11y;
    result.passed = a11y.untaggedInputs === 0 && a11y.untaggedButtons === 0;
  } catch (error) {
    result.passed = false;
    result.error = error.message;
  }

  return result;
}

/**
 * Test CRUD badge colors
 */
async function testCRUDBadges(page) {
  const result = {
    passed: true,
    badges: {
      found: 0,
      colors: {}
    }
  };

  try {
    const badgeInfo = await page.evaluate(() => {
      const badges = document.querySelectorAll('[class*="badge"], [class*="CRUD"], [class*="crud"]');
      const info = {
        found: badges.length,
        colors: {}
      };

      badges.forEach((badge, idx) => {
        const color = getComputedStyle(badge).backgroundColor;
        const text = badge.textContent.trim().substring(0, 20);
        info.colors[`badge_${idx}`] = { text, color };
      });

      return info;
    });

    result.badges = badgeInfo;
    result.passed = badgeInfo.found >= 0; // Always pass; finding badges is informational
  } catch (error) {
    result.passed = false;
    result.error = error.message;
  }

  return result;
}

/**
 * Output results
 */
function outputResults() {
  if (outputFormat === 'json') {
    console.log(JSON.stringify(results, null, 2));
  } else {
    outputReadable();
  }
}

function outputReadable() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 UI DESIGN COMPLIANCE REPORT');
  console.log('='.repeat(70));
  console.log(`URL: ${results.url}`);
  console.log(`Time: ${results.timestamp}\n`);

  let allPassed = true;

  // Structure
  if (results.tests.structure) {
    console.log('📐 PAGE STRUCTURE');
    const s = results.tests.structure;
    console.log(`  Header: ${s.checks.headerVisible ? '✅' : '❌'}`);
    console.log(`  Main Content: ${s.checks.mainContentVisible ? '✅' : '❌'}`);
    console.log(`  Sidebar: ${s.checks.sidebarVisible ? '✅' : '❌'}`);
    console.log(`  Status: ${s.passed ? '✅ PASS' : '❌ FAIL'}\n`);
    if (!s.passed) allPassed = false;
  }

  // Design tokens
  if (results.tests.tokens) {
    console.log('🎯 DESIGN TOKENS');
    const t = results.tests.tokens;
    Object.entries(t.tokens).forEach(([key, val]) => {
      const display = val ? val.substring(0, 30) : 'not set';
      console.log(`  ${key}: ${display}`);
    });
    console.log(`  Status: ${t.passed ? '✅ PASS' : '❌ FAIL'}\n`);
    if (!t.passed) allPassed = false;
  }

  // Typography
  if (results.tests.typography) {
    console.log('📝 TYPOGRAPHY');
    const ty = results.tests.typography;
    console.log(`  Inter Font: ${ty.checks.interFontLoaded ? '✅' : '❌'}`);
    console.log(`  Monospace Font: ${ty.checks.monoFontPresent ? '✅' : '⚠️'}`);
    if (ty.checks.headingHierarchy) {
      const h = ty.checks.headingHierarchy;
      console.log(`  Headings: H1(${h.h1s}) H2(${h.h2s}) H3(${h.h3s})`);
    }
    console.log(`  Status: ${ty.passed ? '✅ PASS' : '❌ FAIL'}\n`);
    if (!ty.passed) allPassed = false;
  }

  // Interactive elements
  if (results.tests.interactive) {
    console.log('🔘 INTERACTIVE ELEMENTS');
    const i = results.tests.interactive;
    console.log(`  Buttons: ${i.elements.buttons}`);
    console.log(`  Inputs: ${i.elements.inputs}`);
    console.log(`  Links: ${i.elements.links}`);
    console.log(`  Forms: ${i.elements.forms}`);
    console.log(`  Status: ${i.passed ? '✅ PASS' : '❌ FAIL'}\n`);
    if (!i.passed) allPassed = false;
  }

  // Accessibility
  if (results.tests.accessibility) {
    console.log('♿ ACCESSIBILITY');
    const a = results.tests.accessibility;
    console.log(`  Untagged Inputs: ${a.checks.untaggedInputs}`);
    console.log(`  Untagged Buttons: ${a.checks.untaggedButtons}`);
    console.log(`  Form Labels: ${a.checks.formLabels}`);
    console.log(`  ARIA Labels: ${a.checks.ariaLabels}`);
    console.log(`  Status: ${a.passed ? '✅ PASS' : '❌ FAIL'}\n`);
    if (!a.passed) allPassed = false;
  }

  // CRUD badges
  if (results.tests.crudBadges) {
    console.log('🏷️  CRUD BADGES');
    const c = results.tests.crudBadges;
    console.log(`  Found: ${c.badges.found}`);
    if (c.badges.found > 0) {
      Object.entries(c.badges.colors).forEach(([key, val]) => {
        console.log(`    ${key}: ${val.text} (${val.color})`);
      });
    }
    console.log(`  Status: ${c.passed ? '✅ PASS' : '❌ FAIL'}\n`);
  }

  // Summary
  console.log('='.repeat(70));
  console.log(`OVERALL: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('='.repeat(70) + '\n');

  process.exit(allPassed ? 0 : 1);
}

/**
 * Main execution
 */
async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`\n🌐 Loading ${targetURL}...`);
    await page.goto(targetURL, { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ Page loaded\n');

    // Run all tests
    results.tests.structure = await testPageStructure(page);
    results.tests.tokens = await testDesignTokens(page);
    results.tests.typography = await testTypography(page);
    results.tests.interactive = await testInteractiveElements(page);
    results.tests.accessibility = await testAccessibility(page);
    results.tests.crudBadges = await testCRUDBadges(page);

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    results.error = error.message;
  } finally {
    await browser.close();
    outputResults();
  }
}

main();
