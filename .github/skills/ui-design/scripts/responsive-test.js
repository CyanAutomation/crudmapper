#!/usr/bin/env node

/**
 * Responsive Design Test
 * 
 * Tests UI design system compliance across multiple viewports.
 * Validates layout, spacing, and visual consistency at:
 * - Mobile (375px)
 * - Tablet (768px)
 * - Desktop (1440px)
 * 
 * Usage:
 *   node responsive-test.js [--viewport mobile|tablet|desktop] [--url <url>]
 */

import { chromium } from '@playwright/test';

// Parse CLI arguments
const args = process.argv.slice(2);
let targetViewport = null;
let targetURL = 'http://localhost:8000';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--viewport' && args[i + 1]) {
    targetViewport = args[i + 1].toLowerCase();
  }
  if (args[i] === '--url' && args[i + 1]) {
    targetURL = args[i + 1];
  }
}

const viewports = {
  mobile: { width: 375, height: 667, label: 'Mobile (375px)' },
  tablet: { width: 768, height: 1024, label: 'Tablet (768px)' },
  desktop: { width: 1440, height: 900, label: 'Desktop (1440px)' }
};

const results = {
  timestamp: new Date().toISOString(),
  url: targetURL,
  viewports: {}
};

/**
 * Test layout at specific viewport
 */
async function testViewport(page, viewportKey, viewportConfig) {
  const result = {
    name: viewportConfig.label,
    width: viewportConfig.width,
    height: viewportConfig.height,
    checks: {},
    measurements: {}
  };

  try {
    // Set viewport
    await page.setViewportSize({
      width: viewportConfig.width,
      height: viewportConfig.height
    });

    // Wait for layout to settle
    await page.waitForTimeout(500);

    // Check main content visibility
    const mainVisible = await page.locator('main').first().isVisible().catch(() => false);
    result.checks.mainVisible = mainVisible;

    // Check if layout is scrollable (height > window)
    const isScrollable = await page.evaluate(() => {
      return document.documentElement.scrollHeight > window.innerHeight;
    });
    result.checks.scrollableContent = isScrollable;

    // Check sidebar at different viewports
    const sidebarVisible = await page.locator('[role="navigation"], aside, .sidebar')
      .first()
      .isVisible()
      .catch(() => false);
    result.checks.sidebarVisible = sidebarVisible;

    // Check for layout shifts or overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return window.innerWidth < document.documentElement.scrollWidth;
    });
    result.checks.noHorizontalOverflow = !hasHorizontalScroll;

    // Get computed font sizes
    const fontSizes = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      const body = document.body;
      
      return {
        h1Size: h1 ? getComputedStyle(h1).fontSize : 'N/A',
        h2Size: h2 ? getComputedStyle(h2).fontSize : 'N/A',
        bodySize: getComputedStyle(body).fontSize
      };
    });
    result.measurements.fontSizes = fontSizes;

    // Check touch target sizes (important for mobile)
    const buttonSizes = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      if (buttons.length === 0) return [];
      
      return buttons.slice(0, 3).map(btn => {
        const rect = btn.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          minTouchTarget: rect.height >= 44 && rect.width >= 44
        };
      });
    });
    result.measurements.buttonSizes = buttonSizes;

    // Viewport-specific warnings
    if (viewportKey === 'mobile' && !result.checks.noHorizontalOverflow) {
      result.warning = 'Horizontal scroll detected on mobile viewport';
    }

    if (viewportKey === 'mobile') {
      const minTouchTargets = buttonSizes.filter(b => b.minTouchTarget).length;
      result.measurements.touchTargetCompliance = `${minTouchTargets}/${buttonSizes.length} buttons >= 44px`;
    }

    result.passed = mainVisible && result.checks.noHorizontalOverflow;

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
  console.log('\n' + '='.repeat(70));
  console.log('📱 RESPONSIVE DESIGN TEST REPORT');
  console.log('='.repeat(70));
  console.log(`URL: ${results.url}`);
  console.log(`Time: ${results.timestamp}\n`);

  let allPassed = true;

  Object.entries(results.viewports).forEach(([key, viewport]) => {
    console.log(`\n${viewport.name}`);
    console.log(`Dimensions: ${viewport.width}×${viewport.height}`);
    console.log('-'.repeat(70));

    console.log('Checks:');
    console.log(`  Main Content Visible: ${viewport.checks.mainVisible ? '✅' : '❌'}`);
    console.log(`  Sidebar Visible: ${viewport.checks.sidebarVisible ? '✅' : '⚠️'}`);
    console.log(`  No Horizontal Overflow: ${viewport.checks.noHorizontalOverflow ? '✅' : '❌'}`);
    console.log(`  Content Scrollable: ${viewport.checks.scrollableContent ? '✅' : '⚠️'}`);

    if (viewport.measurements.fontSizes) {
      console.log('\nFont Sizes:');
      console.log(`  H1: ${viewport.measurements.fontSizes.h1Size}`);
      console.log(`  H2: ${viewport.measurements.fontSizes.h2Size}`);
      console.log(`  Body: ${viewport.measurements.fontSizes.bodySize}`);
    }

    if (viewport.measurements.touchTargetCompliance) {
      console.log(`\nTouch Targets (Mobile): ${viewport.measurements.touchTargetCompliance}`);
    }

    if (viewport.measurements.buttonSizes && viewport.measurements.buttonSizes.length > 0) {
      console.log('\nButton Sizes (Sample):');
      viewport.measurements.buttonSizes.forEach((btn, idx) => {
        const status = btn.minTouchTarget ? '✅' : '⚠️';
        console.log(`  Button ${idx}: ${btn.width}×${btn.height}px ${status}`);
      });
    }

    if (viewport.warning) {
      console.log(`\n⚠️  Warning: ${viewport.warning}`);
    }

    console.log(`\nStatus: ${viewport.passed ? '✅ PASS' : '❌ FAIL'}`);

    if (!viewport.passed) allPassed = false;
  });

  console.log('\n' + '='.repeat(70));
  console.log(`OVERALL: ${allPassed ? '✅ ALL VIEWPORTS PASSED' : '⚠️  ISSUES DETECTED'}`);
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

    // Test targeted viewport or all viewports
    const viewportsToTest = targetViewport
      ? { [targetViewport]: viewports[targetViewport] }
      : viewports;

    for (const [key, config] of Object.entries(viewportsToTest)) {
      console.log(`Testing ${config.label}...`);
      results.viewports[key] = await testViewport(page, key, config);
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    results.error = error.message;
  } finally {
    await browser.close();
    outputResults();
  }
}

main();
