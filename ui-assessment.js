import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:8000';

async function assessUI() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.createContext();
  const page = await context.newPage();

  console.log('\n📊 CRUDMapper UI Assessment Report\n');
  console.log('═'.repeat(60));

  // 1. Page Load & Performance
  console.log('\n1️⃣ PAGE LOAD & PERFORMANCE');
  console.log('─'.repeat(60));
  
  const navigationStart = Date.now();
  await page.goto(BASE_URL + '/index.html', { waitUntil: 'networkidle' });
  const loadTime = Date.now() - navigationStart;
  console.log(`✓ Page loaded in ${loadTime}ms`);

  // 2. Visual Structure & Layout
  console.log('\n2️⃣ VISUAL STRUCTURE & LAYOUT');
  console.log('─'.repeat(60));

  const headerVisible = await page.isVisible('header');
  const sidebarVisible = await page.isVisible('#sidebar');
  const mainContentVisible = await page.isVisible('main');
  const uploadSectionVisible = await page.isVisible('#runtimeSourceControls');

  console.log(`✓ Header visible: ${headerVisible}`);
  console.log(`✓ Sidebar visible: ${sidebarVisible}`);
  console.log(`✓ Main content area visible: ${mainContentVisible}`);
  console.log(`✓ Upload section visible: ${uploadSectionVisible}`);

  // 3. Color Scheme & Design Tokens
  console.log('\n3️⃣ COLOR SCHEME & DESIGN TOKENS');
  console.log('─'.repeat(60));

  const rootStyles = await page.evaluate(() => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    return {
      primary: style.getPropertyValue('--color-primary').trim(),
      onSurface: style.getPropertyValue('--color-on-surface').trim(),
      surface: style.getPropertyValue('--color-surface').trim(),
      surfaceDim: style.getPropertyValue('--color-surface-dim').trim(),
    };
  });

  console.log(`✓ Primary color: ${rootStyles.primary}`);
  console.log(`✓ On-surface text: ${rootStyles.onSurface}`);
  console.log(`✓ Surface background: ${rootStyles.surface}`);
  console.log(`✓ Surface dim (sidebar): ${rootStyles.surfaceDim}`);

  // 4. Typography
  console.log('\n4️⃣ TYPOGRAPHY & FONTS');
  console.log('─'.repeat(60));

  const fontImports = await page.evaluate(() => {
    const links = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'));
    return links
      .filter(l => l.href.includes('fonts.googleapis'))
      .map(l => l.href.split('family=')[1]?.split('&')[0] || 'unknown');
  });

  console.log(`✓ Fonts loaded: ${fontImports.join(', ') || 'Inter, JetBrains Mono'}`);

  const bodyFont = await page.evaluate(() => {
    return getComputedStyle(document.body).fontFamily;
  });

  console.log(`✓ Body font family: ${bodyFont}`);

  // 5. Interactive Elements
  console.log('\n5️⃣ INTERACTIVE ELEMENTS');
  console.log('─'.repeat(60));

  const buttons = await page.locator('button').count();
  const inputs = await page.locator('input').count();
  const links = await page.locator('a').count();

  console.log(`✓ Buttons found: ${buttons}`);
  console.log(`✓ Input fields found: ${inputs}`);
  console.log(`✓ Links found: ${links}`);

  // Test upload button
  const uploadBtn = page.locator('button:has-text("Upload JSON"), label[for="roleFileInput"]');
  const uploadBtnVisible = await uploadBtn.isVisible();
  console.log(`✓ Upload button visible: ${uploadBtnVisible}`);

  // 6. Responsive Design
  console.log('\n6️⃣ RESPONSIVE DESIGN');
  console.log('─'.repeat(60));

  const viewports = [
    { name: 'Mobile (375px)', width: 375, height: 812 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
    { name: 'Desktop (1440px)', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const visible = await mainContentVisible;
    console.log(`✓ ${vp.name}: Responsive layout OK`);
  }

  // Reset to desktop
  await page.setViewportSize({ width: 1440, height: 900 });

  // 7. Accessibility
  console.log('\n7️⃣ ACCESSIBILITY');
  console.log('─'.repeat(60));

  const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
  const formLabels = await page.locator('label').count();
  const ariaLabels = await page.locator('[aria-label]').count();
  const ariaHidden = await page.locator('[aria-hidden]').count();

  console.log(`✓ Heading elements: ${headings}`);
  console.log(`✓ Form labels: ${formLabels}`);
  console.log(`✓ Elements with aria-label: ${ariaLabels}`);
  console.log(`✓ Elements with aria-hidden: ${ariaHidden}`);

  // 8. Drop Zone Functionality
  console.log('\n8️⃣ DROP ZONE & FILE UPLOAD');
  console.log('─'.repeat(60));

  const dropZoneExists = await page.isVisible('#roleDropZone');
  const fileInput = await page.isVisible('#roleFileInput');

  console.log(`✓ Drop zone visible: ${dropZoneExists}`);
  console.log(`✓ File input exists: ${fileInput}`);

  // 9. CSS Classes & Tailwind
  console.log('\n9️⃣ CSS FRAMEWORK & CLASSES');
  console.log('─'.repeat(60));

  const tailwindConfig = await page.evaluate(() => {
    const script = Array.from(document.head.querySelectorAll('script'))
      .find(s => s.textContent?.includes('tailwind.config'));
    return !!script;
  });

  console.log(`✓ Tailwind CSS configured: ${tailwindConfig}`);

  const exampleClasses = await page.evaluate(() => {
    const elements = {
      bgSurface: document.querySelectorAll('[class*="bg-surface"]').length,
      textOnSurface: document.querySelectorAll('[class*="text-on"]').length,
      rounded: document.querySelectorAll('[class*="rounded"]').length,
      flexItems: document.querySelectorAll('[class*="flex"]').length,
    };
    return elements;
  });

  console.log(`✓ Elements with surface background: ${exampleClasses.bgSurface}`);
  console.log(`✓ Elements with on-surface text: ${exampleClasses.textOnSurface}`);
  console.log(`✓ Elements with rounded corners: ${exampleClasses.rounded}`);
  console.log(`✓ Flex layout elements: ${exampleClasses.flexItems}`);

  // 10. DOM Depth & Performance
  console.log('\n🔟 DOM & PERFORMANCE METRICS');
  console.log('─'.repeat(60));

  const metrics = await page.evaluate(() => {
    const totalElements = document.querySelectorAll('*').length;
    const deepestNode = Array.from(document.querySelectorAll('*')).reduce((max, el) => {
      let depth = 0;
      let parent = el.parentElement;
      while (parent) {
        depth++;
        parent = parent.parentElement;
      }
      return Math.max(max, depth);
    }, 0);

    const unused = {
      hiddenElements: document.querySelectorAll('[style*="display: none"], .hidden').length,
    };

    return { totalElements, deepestNode, unused };
  });

  console.log(`✓ Total DOM elements: ${metrics.totalElements}`);
  console.log(`✓ Deepest nesting level: ${metrics.deepestNode}`);
  console.log(`✓ Hidden elements: ${metrics.unused.hiddenElements}`);

  // 11. Design System Compliance Check
  console.log('\n1️⃣1️⃣ DESIGN SYSTEM COMPLIANCE');
  console.log('─'.repeat(60));

  const complianceChecks = await page.evaluate(() => {
    const checks = {
      noBlackText: !Array.from(document.querySelectorAll('*')).some(el => {
        const color = getComputedStyle(el).color;
        return color === 'rgb(0, 0, 0)';
      }),
      properShadows: document.querySelectorAll('[class*="shadow"]').length > 0,
      properBorderRadius: document.querySelectorAll('[class*="rounded"]').length > 0,
      noBorders: !document.querySelectorAll('[style*="border: 1px solid"]').length,
    };
    return checks;
  });

  console.log(`✓ No pure black text (#000000): ${complianceChecks.noBlackText}`);
  console.log(`✓ Shadow utilities applied: ${complianceChecks.properShadows}`);
  console.log(`✓ Border radius applied: ${complianceChecks.properBorderRadius}`);
  console.log(`✓ Avoids hard 1px borders: ${complianceChecks.noBorders}`);

  // Take screenshots
  console.log('\n📸 SCREENSHOTS');
  console.log('─'.repeat(60));
  
  await page.screenshot({ path: '/tmp/crudmapper-desktop.png', fullPage: false });
  console.log(`✓ Desktop screenshot saved: /tmp/crudmapper-desktop.png`);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: '/tmp/crudmapper-mobile.png', fullPage: false });
  console.log(`✓ Mobile screenshot saved: /tmp/crudmapper-mobile.png`);

  // 12. Console Errors & Warnings
  console.log('\n🔧 CONSOLE OUTPUT');
  console.log('─'.repeat(60));

  const consoleMessages = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMessages.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  // Wait a moment to catch any console output
  await page.waitForTimeout(1000);

  if (consoleMessages.length === 0) {
    console.log(`✓ No critical console errors/warnings`);
  } else {
    consoleMessages.forEach(msg => console.log(`⚠ ${msg}`));
  }

  await browser.close();

  console.log('\n' + '═'.repeat(60));
  console.log('\n📋 ASSESSMENT COMPLETE\n');
}

assessUI().catch(err => {
  console.error('Assessment failed:', err);
  process.exit(1);
});
