#!/usr/bin/env node

/**
 * Custom Design Validation Template
 * 
 * This is a template showing how to create custom design validation tests
 * using Playwright. Copy this file and extend it with your own assertions.
 * 
 * Usage:
 *   node custom-validation-template.js [--url <url>] [--format json|readable]
 * 
 * Customize the test functions below to match your design requirements.
 */

import { chromium } from '@playwright/test';

// Configuration
const args = process.argv.slice(2);
let targetURL = 'http://localhost:8000';
let outputFormat = 'readable';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) targetURL = args[i + 1];
  if (args[i] === '--format' && args[i + 1]) outputFormat = args[i + 1];
}

const results = {
  timestamp: new Date().toISOString(),
  url: targetURL,
  customTests: {}
};

/**
 * EXAMPLE 1: Validate specific design tokens
 * 
 * Customize this to match your design system requirements
 */
async function testDesignTokens(page) {
  const result = {
    name: 'Design Tokens',
    passed: true,
    checks: {}
  };

  try {
    // Define expected token values
    // Update these to match your actual design system
    const expectedTokens = {
      '--color-primary': ['#565e74', 'rgb(86, 94, 116)'],
      '--color-surface': ['#f5f7fa', 'rgb(245, 247, 250)'],
      '--spacing-base': ['1rem', '16px'],
      '--border-radius': ['0.375rem', '6px']
    };

    const computedTokens = await page.evaluate((expected) => {
      const root = getComputedStyle(document.documentElement);
      const actual = {};
      const mismatches = [];

      Object.keys(expected).forEach(token => {
        const value = root.getPropertyValue(token).trim();
        actual[token] = value;

        // Check if value matches any expected variation
        const matches = expected[token].some(expectedVal =>
          value.includes(expectedVal.replace('#', '')) || value === expectedVal
        );

        if (!matches && value) {
          mismatches.push({
            token,
            expected: expected[token][0],
            actual: value
          });
        }
      });

      return { actual, mismatches };
    }, expectedTokens);

    result.checks.tokens = computedTokens.actual;
    result.passed = computedTokens.mismatches.length === 0;

    if (!result.passed) {
      result.issues = computedTokens.mismatches;
    }

  } catch (error) {
    result.passed = false;
    result.error = error.message;
  }

  return result;
}

/**
 * EXAMPLE 2: Validate CRUD badge colors
 * 
 * Checks that permission badges use correct semantic colors
 */
async function testCRUDBadgeColors(page) {
  const result = {
    name: 'CRUD Badge Colors',
    passed: true,
    badges: {}
  };

  try {
    // Define expected CRUD colors
    const expectedColors = {
      'create': '#10b981', // Green
      'read': '#3b82f6',   // Blue
      'update': '#f59e0b', // Amber
      'delete': '#ef4444'  // Red
    };

    const badgeColors = await page.evaluate((expected) => {
      const found = {};
      const mismatches = [];

      Object.keys(expected).forEach(operation => {
        const badge = document.querySelector(`[class*="badge--crud-${operation}"]`);
        if (badge) {
          const bgColor = getComputedStyle(badge).backgroundColor;
          found[operation] = bgColor;

          // Simple check: if expected has 'b981' (part of #10b981), should appear in RGB value
          const expectedHex = expected[operation];
          const expectedRGB = hexToRgb(expectedHex);

          if (!bgColor.includes(expectedRGB.r.toString()) &&
              !bgColor.includes(expectedHex)) {
            mismatches.push({
              operation,
              expected: expectedHex,
              actual: bgColor
            });
          }
        }
      });

      return { found, mismatches };
    }, expectedColors);

    result.badges = badgeColors.found;
    result.passed = badgeColors.mismatches.length === 0;

    if (!result.passed) {
      result.colorMismatches = badgeColors.mismatches;
    }

  } catch (error) {
    result.passed = false;
    result.error = error.message;
  }

  return result;
}

/**
 * EXAMPLE 3: Validate component structure
 * 
 * Checks that components follow expected DOM structure
 */
async function testComponentStructure(page) {
  const result = {
    name: 'Component Structure',
    passed: true,
    structure: {}
  };

  try {
    const structure = await page.evaluate(() => {
      return {
        // Check for header with proper semantic elements
        headerStructure: {
          hasHeader: !!document.querySelector('header'),
          hasLogo: !!document.querySelector('header img, header [role="img"]'),
          hasNav: !!document.querySelector('header nav, header [role="navigation"]')
        },

        // Check for main content area
        contentStructure: {
          hasMain: !!document.querySelector('main'),
          hasSidebar: !!document.querySelector('aside, [role="navigation"]'),
          hasArticles: document.querySelectorAll('article').length > 0
        },

        // Check for proper form structure
        formStructure: {
          hasForms: !!document.querySelector('form'),
          formsWithLabels: Array.from(document.querySelectorAll('form')).filter(form => {
            const inputs = form.querySelectorAll('input');
            const labels = form.querySelectorAll('label');
            return inputs.length > 0 && labels.length > 0;
          }).length
        }
      };
    });

    result.structure = structure;

    // Define validation rules
    const valid = {
      header: structure.headerStructure.hasHeader && structure.headerStructure.hasLogo,
      content: structure.contentStructure.hasMain,
      forms: !structure.formStructure.hasForms || structure.formStructure.formsWithLabels > 0
    };

    result.passed = Object.values(valid).every(v => v);

  } catch (error) {
    result.passed = false;
    result.error = error.message;
  }

  return result;
}

/**
 * EXAMPLE 4: Validate responsive behavior
 * 
 * Tests specific breakpoint behavior
 */
async function testResponsiveBehavior(page) {
  const result = {
    name: 'Responsive Behavior',
    passed: true,
    breakpoints: {}
  };

  try {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 }
    ];

    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.waitForTimeout(300); // Let layout settle

      const behavior = await page.evaluate((viewport) => {
        return {
          viewport: viewport.name,
          noHorizontalScroll: window.innerWidth >= document.documentElement.scrollWidth,
          mainVisible: !!document.querySelector('main')?.offsetHeight,
          mobileMenuExpected: viewport.width < 768
        };
      }, bp);

      result.breakpoints[bp.name] = behavior;
    }

    // Reset viewport
    await page.setViewportSize({ width: 1440, height: 900 });

  } catch (error) {
    result.passed = false;
    result.error = error.message;
  }

  return result;
}

/**
 * EXAMPLE 5: Validate custom business logic
 * 
 * Add assertions specific to your application
 */
async function testBusinessLogic(page) {
  const result = {
    name: 'Business Logic',
    passed: true,
    checks: {}
  };

  try {
    // CUSTOMIZE THIS: Add checks for your specific requirements
    // Examples below are placeholders

    const checks = await page.evaluate(() => {
      return {
        // Check for file upload functionality
        hasUploadZone: !!document.querySelector('[role="region"], .dropzone, [data-dropzone]'),

        // Check for role/permission display
        hasRoleDetail: !!document.querySelector('[role="main"], main'),

        // Check for search/filter functionality
        hasSearch: !!document.querySelector('input[type="search"], input[placeholder*="search"]'),

        // Check for data table or list
        hasDataDisplay: !!document.querySelector('table, [role="list"], [role="grid"]')
      };
    });

    result.checks = checks;
    result.passed = Object.values(checks).some(v => v); // At least one feature present

  } catch (error) {
    result.passed = false;
    result.error = error.message;
  }

  return result;
}

/**
 * Helper: Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
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
  console.log('🎨 CUSTOM DESIGN VALIDATION REPORT');
  console.log('='.repeat(70));
  console.log(`URL: ${results.url}`);
  console.log(`Time: ${results.timestamp}\n`);

  let allPassed = true;

  Object.entries(results.customTests).forEach(([key, test]) => {
    const status = test.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${test.name}`);

    if (test.checks && Object.keys(test.checks).length > 0) {
      Object.entries(test.checks).forEach(([name, value]) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
        console.log(`    ${name}: ${displayValue}`);
      });
    }

    if (test.issues) {
      console.log(`    Issues:`);
      test.issues.forEach(issue => {
        console.log(`      - ${issue.operation}: expected ${issue.expected}, got ${issue.actual}`);
      });
    }

    if (test.error) {
      console.log(`    Error: ${test.error}`);
    }

    console.log();

    if (!test.passed) allPassed = false;
  });

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

    // Run all custom tests
    // Add or remove tests as needed for your requirements
    results.customTests.designTokens = await testDesignTokens(page);
    results.customTests.crudBadges = await testCRUDBadgeColors(page);
    results.customTests.structure = await testComponentStructure(page);
    results.customTests.responsive = await testResponsiveBehavior(page);
    results.customTests.businessLogic = await testBusinessLogic(page);

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    results.error = error.message;
  } finally {
    await browser.close();
    outputResults();
  }
}

main();
