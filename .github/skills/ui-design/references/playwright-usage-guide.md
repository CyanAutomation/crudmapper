# Playwright Usage Guide for Design Validation

This guide explains how to use Playwright for design system testing and extend the provided scripts with custom validations.

## Playwright Basics

Playwright is a browser automation library for testing modern web applications. It can:
- Launch headless browsers (Chromium, Firefox, WebKit)
- Navigate pages and interact with elements
- Inspect DOM, compute styles, and evaluate JavaScript
- Test responsiveness across different viewports
- Capture screenshots and visual comparisons

### Installation

Playwright is already installed as `@playwright/test` (v1.58.2). Browsers must be installed separately:

```bash
npx playwright install
```

Or via the setup script:
```bash
node .github/skills/ui-design/scripts/setup-playwright.js
```

## Common Commands for Design Validation

### Navigate to Page

```javascript
const { chromium } = require('@playwright/test');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
```

### Set Viewport Size

Test responsiveness by changing viewport:

```javascript
await page.setViewportSize({ width: 375, height: 667 }); // Mobile
await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
await page.setViewportSize({ width: 1440, height: 900 }); // Desktop
```

### Check Element Visibility

```javascript
const isVisible = await page.locator('header').isVisible();
const isHidden = await page.locator('[aria-hidden="true"]').isHidden();
```

### Get Computed Styles

```javascript
const color = await page.locator('button').evaluate(el => 
  getComputedStyle(el).backgroundColor
);
```

### Evaluate JavaScript in Page

```javascript
const result = await page.evaluate(() => {
  return {
    colorPrimary: getComputedStyle(document.documentElement).getPropertyValue('--color-primary'),
    headingCount: document.querySelectorAll('h1, h2, h3').length,
    fontFamily: getComputedStyle(document.body).fontFamily
  };
});
```

### Query Elements

```javascript
// Find single element
const button = page.locator('button').first();

// Find by role
const heading = page.locator('[role="heading"]');

// Find by CSS class
const badge = page.locator('.badge--crud-create');

// Find by ARIA attribute
const label = page.locator('[aria-label="Delete role"]');

// Find all matching
const allButtons = page.locator('button');
const count = await allButtons.count();
```

### Take Screenshots

```javascript
// Full page screenshot
await page.screenshot({ path: 'screenshot.png' });

// Specific element
await page.locator('main').screenshot({ path: 'main-content.png' });
```

### Wait for Elements

```javascript
// Wait for element to appear
await page.locator('.modal').waitFor({ state: 'visible' });

// Wait for custom condition
await page.waitForFunction(() => {
  return document.querySelectorAll('[role="button"]').length > 5;
});

// Wait for stable network
await page.goto(url, { waitUntil: 'networkidle' });
```

## Design System Validation Patterns

### Check CSS Variables

```javascript
const cssVariables = await page.evaluate(() => {
  const root = getComputedStyle(document.documentElement);
  return {
    colorPrimary: root.getPropertyValue('--color-primary').trim(),
    colorSurface: root.getPropertyValue('--color-surface').trim(),
    spacingBase: root.getPropertyValue('--spacing-base').trim(),
    radiusMd: root.getPropertyValue('--radius-md').trim()
  };
});

console.log('Primary Color:', cssVariables.colorPrimary);
```

### Verify Color Accuracy

```javascript
const crudBadges = await page.evaluate(() => {
  const badges = {
    create: null,
    read: null,
    update: null,
    delete: null
  };
  
  // Find badges by role or class
  const createBadge = document.querySelector('.badge--crud-create');
  if (createBadge) {
    badges.create = getComputedStyle(createBadge).backgroundColor;
  }
  
  return badges;
});

console.log('CRUD Colors:', crudBadges);
// Expected: create=#10b981, read=#3b82f6, update=#f59e0b, delete=#ef4444
```

### Test Font Loading

```javascript
const fonts = await page.evaluate(() => {
  return {
    bodyFont: getComputedStyle(document.body).fontFamily,
    codeFont: getComputedStyle(document.querySelector('code') || document.body).fontFamily,
    isInterLoaded: document.fonts.check('400 1rem "Inter"'),
    isMonoLoaded: document.fonts.check('400 1rem "JetBrains Mono"')
  };
});

console.log(fonts.isInterLoaded ? '✅ Inter loaded' : '❌ Inter missing');
console.log(fonts.isMonoLoaded ? '✅ Mono loaded' : '❌ Mono missing');
```

### Validate Heading Hierarchy

```javascript
const headingHierarchy = await page.evaluate(() => {
  const headings = [];
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
    headings.push({
      level: parseInt(h.tagName[1]),
      text: h.textContent.substring(0, 50)
    });
  });
  
  // Check for missing levels
  let prevLevel = 0;
  const hasGaps = headings.some(h => {
    const gap = h.level - prevLevel > 1;
    prevLevel = h.level;
    return gap;
  });
  
  return { headings, hasHierarchyGaps: hasGaps };
});
```

### Check Touch Target Sizes (Mobile Accessibility)

```javascript
const touchTargets = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
  const issues = [];
  
  buttons.forEach((btn, idx) => {
    const rect = btn.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      issues.push({
        index: idx,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        text: btn.textContent.substring(0, 20)
      });
    }
  });
  
  return {
    totalButtons: buttons.length,
    compliantButtons: buttons.length - issues.length,
    issues
  };
});
```

### Verify Responsive Layout

```javascript
const responsiveCheck = await page.evaluate(() => {
  return {
    hasHorizontalScroll: window.innerWidth < document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    pageWidth: document.documentElement.scrollWidth,
    mainVisible: !!document.querySelector('main'),
    sidebarVisible: !!document.querySelector('aside, [role="navigation"]')
  };
});

console.log(responsiveCheck.hasHorizontalScroll ? '❌ Horizontal scroll' : '✅ No overflow');
```

### Count Interactive Elements

```javascript
const interactiveElements = await page.evaluate(() => {
  return {
    buttons: document.querySelectorAll('button').length,
    inputs: document.querySelectorAll('input').length,
    links: document.querySelectorAll('a').length,
    forms: document.querySelectorAll('form').length,
    selects: document.querySelectorAll('select').length,
    dropzones: document.querySelectorAll('[role="region"], .dropzone').length
  };
});
```

## Creating Custom Test Scripts

### Template Structure

```javascript
#!/usr/bin/env node

import { chromium } from '@playwright/test';

async function runCustomTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
    
    // Your custom validation logic
    const result = await page.evaluate(() => {
      // Return validation data
      return {
        passed: true,
        checks: {}
      };
    });
    
    console.log('Test Result:', result);
    process.exit(result.passed ? 0 : 1);
    
  } finally {
    await browser.close();
  }
}

runCustomTest();
```

### Example: Custom Color Validation

```javascript
const colorValidation = await page.evaluate(() => {
  const errors = [];
  
  // Define expected colors
  const expected = {
    primary: '#565e74',
    createBadge: '#10b981',
    readBadge: '#3b82f6',
    updateBadge: '#f59e0b',
    deleteBadge: '#ef4444'
  };
  
  // Check primary color
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
  if (!primary.includes('565e74') && !primary.includes('rgb(86, 94, 116)')) {
    errors.push(`Primary color mismatch: ${primary}`);
  }
  
  // Check CRUD badges
  const badges = document.querySelectorAll('[class*="badge--crud"]');
  badges.forEach((badge, idx) => {
    const bgColor = getComputedStyle(badge).backgroundColor;
    console.log(`Badge ${idx}: ${bgColor}`);
  });
  
  return { passed: errors.length === 0, errors };
});
```

## Extending Provided Scripts

The three main scripts can be extended:

### Add Custom Checks to design-compliance-check.js

Modify the script to add new test functions like `testDesignTokens()`:

```javascript
async function testCRUDPermissions(page) {
  const result = {
    passed: true,
    permissions: {}
  };
  
  // Check for permission indicators
  const perms = await page.evaluate(() => {
    return {
      hasCreateBadges: !!document.querySelector('.badge--crud-create'),
      hasReadBadges: !!document.querySelector('.badge--crud-read'),
      // ... more checks
    };
  });
  
  result.permissions = perms;
  return result;
}

// Then in main(), add:
// results.tests.crudPermissions = await testCRUDPermissions(page);
```

### Add Viewport-Specific Tests to responsive-test.js

```javascript
async function testViewport(page, viewportKey, viewportConfig) {
  // ... existing code ...
  
  // Add custom check
  const customCheck = await page.evaluate(() => {
    // Mobile-specific checks
    return {
      sidebarCollapsed: !document.querySelector('aside:visible'),
      acceptableLineLength: document.body.offsetWidth < 800
    };
  });
  
  result.customChecks = customCheck;
  return result;
}
```

## Debugging Tips

### Enable Headed Mode (See Browser)

For debugging, run browser in headed mode:

```javascript
const browser = await chromium.launch({ headless: false });
// Browser window will open, let you see what's happening
```

### Add Debug Output

```javascript
await page.evaluate(() => {
  console.log('Current viewport:', window.innerWidth, window.innerHeight);
  console.log('All computed CSS variables:', getComputedStyle(document.documentElement));
});
```

### Take Screenshots at Each Step

```javascript
await page.screenshot({ path: 'step1.png' });
// ... perform actions ...
await page.screenshot({ path: 'step2.png' });
```

### Slow Down Execution

```javascript
await page.waitForTimeout(2000); // Pause 2 seconds to observe
```

## Common Assertion Patterns

```javascript
// Assert visibility
if (!await page.locator('main').isVisible()) {
  throw new Error('Main content not visible');
}

// Assert element count
const buttonCount = await page.locator('button').count();
if (buttonCount < 5) {
  throw new Error(`Expected at least 5 buttons, found ${buttonCount}`);
}

// Assert text content
await page.locator('h1').first().waitFor();
const heading = await page.locator('h1').first().textContent();
if (!heading.includes('expected')) {
  throw new Error(`Heading mismatch: ${heading}`);
}

// Assert computed property
const color = await page.locator('button').evaluate(el => 
  getComputedStyle(el).backgroundColor
);
if (!color.includes('86, 94, 116')) { // RGB for #565e74
  throw new Error(`Button color mismatch: ${color}`);
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **"TypeError: Cannot find module '@playwright/test'"** | Run `npm install` or `npm install @playwright/test` |
| **"Browser launch failed"** | Run `npx playwright install` to install browsers |
| **"Target page, context or browser has been closed"** | Remove premature `browser.close()` or catch errors before closing |
| **"Timeout waiting for selector"** | Element may not exist; check selector or increase timeout |
| **"Color values don't match expectations"** | CSS variables may not be set; check Tailwind config and compiled CSS |
| **"Heading hierarchy issues on mobile"** | Use responsive classes to show/hide headings per viewport |

## Further Resources

- [Official Playwright Docs](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-browser)
- [Selectors Documentation](https://playwright.dev/docs/selectors)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Related Skills

See [custom-validation-template.js](../assets/custom-validation-template.js) for a complete example of extending Playwright validations for custom use cases.
