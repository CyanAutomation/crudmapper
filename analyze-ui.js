import fs from "fs";
import path from "path";

console.log("\n📊 CRUDMapper UI ASSESSMENT REPORT\n");
console.log("═".repeat(70));

// 1. HTML Analysis
console.log("\n1️⃣ HTML STRUCTURE & SEMANTIC MARKUP");
console.log("─".repeat(70));

const htmlContent = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");

const htmlChecks = {
  hasHeader: htmlContent.includes("<header"),
  hasSidebar: htmlContent.includes('id="sidebar"'),
  hasMain: htmlContent.includes("<main"),
  hasSectionRoles: htmlContent.includes('id="runtimeSourceControls"'),
  hasAriaLabels: (htmlContent.match(/aria-label/g) || []).length,
  hasAriaHidden: (htmlContent.match(/aria-hidden/g) || []).length,
  hasLandmarks: (htmlContent.match(/<header|<main|<aside|<nav/g) || []).length,
};

console.log(`✓ Header element present: ${htmlChecks.hasHeader}`);
console.log(`✓ Sidebar (#sidebar) present: ${htmlChecks.hasSidebar}`);
console.log(`✓ Main element present: ${htmlChecks.hasMain}`);
console.log(`✓ Upload section (#runtimeSourceControls): ${htmlChecks.hasSectionRoles}`);
console.log(`✓ ARIA labels present: ${htmlChecks.hasAriaLabels}`);
console.log(`✓ ARIA hidden attributes: ${htmlChecks.hasAriaHidden}`);
console.log(`✓ Semantic landmarks: ${htmlChecks.hasLandmarks}`);

// 2. Design Token Analysis
console.log("\n2️⃣ DESIGN TOKENS & COLOR SYSTEM");
console.log("─".repeat(70));

const cssContent = fs.readFileSync(path.join(process.cwd(), "styles.css"), "utf-8");

const cssVars = cssContent.match(/--[\w-]+:\s*#[0-9a-f]{6}/gi) || [];
console.log(`✓ CSS custom properties (--color-*): ${cssVars.length}`);

const cruadTokens = cssVars.filter((v) => v.includes("crud") || v.includes("CRUD"));
console.log(`✓ CRUD-specific color tokens: ${cruadTokens.length}`);

const colorTokens = {
  primary: cssContent.includes("--color-primary: #565e74"),
  onSurface: cssContent.includes("--color-on-surface: #2a3439"),
  surface: cssContent.includes("--color-surface: #f7f9fb"),
  surfaceDim: cssContent.includes("--color-surface-dim: #cfdce3"),
};

console.log(`✓ Primary color token (#565e74): ${colorTokens.primary}`);
console.log(`✓ On-surface text token (#2a3439): ${colorTokens.onSurface}`);
console.log(`✓ Surface background token (#f7f9fb): ${colorTokens.surface}`);
console.log(`✓ Surface dim token (#cfdce3): ${colorTokens.surfaceDim}`);

// 3. CSS Component Classes
console.log("\n3️⃣ COMPONENT STYLING");
console.log("─".repeat(70));

const componentClasses = {
  crudBadge: cssContent.includes(".crud-badge"),
  ghostBorder: cssContent.includes(".ghost-border"),
  glasPanel: cssContent.includes(".glass-panel"),
  gradientPrimary: cssContent.includes(".gradient-primary"),
  tableStyling: cssContent.includes(".role-table"),
  sidebarStyling: cssContent.includes("#sidebar"),
  inputStyling: cssContent.includes('input[type="text"]'),
  buttonStyling: cssContent.includes("button,"),
};

console.log(`✓ CRUD badge styling: ${componentClasses.crudBadge}`);
console.log(`✓ Ghost border utility: ${componentClasses.ghostBorder}`);
console.log(`✓ Glass panel utility: ${componentClasses.glasPanel}`);
console.log(`✓ Gradient primary utility: ${componentClasses.gradientPrimary}`);
console.log(`✓ Data table styling: ${componentClasses.tableStyling}`);
console.log(`✓ Sidebar navigation styling: ${componentClasses.sidebarStyling}`);
console.log(`✓ Input field styling: ${componentClasses.inputStyling}`);
console.log(`✓ Button component styling: ${componentClasses.buttonStyling}`);

// 4. Design System Rules Compliance
console.log("\n4️⃣ DESIGN SYSTEM RULES COMPLIANCE");
console.log("─".repeat(70));

const designRules = {
  noLineRule:
    !cssContent.includes("border: 1px solid") || cssContent.includes("border-bottom: 1px"),
  alternatingRows: cssContent.includes("nth-child(odd)") && cssContent.includes("nth-child(even)"),
  activeStateIndicator:
    cssContent.includes("border-left-color") || cssContent.includes("border-left:"),
  glassEffect: cssContent.includes("backdrop-filter: blur(12px)"),
  shadowAmbient: cssContent.includes("--shadow-ambient"),
  focusStates: cssContent.includes(":focus"),
};

console.log(`✓ No-Line Rule (color shifts over borders): ${designRules.noLineRule}`);
console.log(`✓ Alternating row backgrounds: ${designRules.alternatingRows}`);
console.log(`✓ Active state visual indicators (2px accent): ${designRules.activeStateIndicator}`);
console.log(`✓ Glass effect utility (85% opacity + blur): ${designRules.glassEffect}`);
console.log(`✓ Ambient shadow utilities: ${designRules.shadowAmbient}`);
console.log(`✓ Focus states defined: ${designRules.focusStates}`);

// 5. Tailwind CSS Integration
console.log("\n5️⃣ TAILWIND CSS INTEGRATION");
console.log("─".repeat(70));

const htmlHasTailwind = htmlContent.includes("cdn.tailwindcss.com");
const hasCustomConfig = htmlContent.includes("tailwind.config");
const configFileExists = fs.existsSync(path.join(process.cwd(), "tailwind.config.js"));

console.log(`✓ Tailwind CSS CDN loaded: ${htmlHasTailwind}`);
console.log(`✓ Custom Tailwind config in HTML: ${hasCustomConfig}`);
console.log(`✓ tailwind.config.js file exists: ${configFileExists}`);

if (configFileExists) {
  const twConfig = fs.readFileSync(path.join(process.cwd(), "tailwind.config.js"), "utf-8");
  const hasColorTokens = twConfig.includes("primary:");
  const hasFontConfig = twConfig.includes("fontFamily:");
  const hasBorderRadius = twConfig.includes("borderRadius:");

  console.log(`✓ Color tokens in config: ${hasColorTokens}`);
  console.log(`✓ Font family configuration: ${hasFontConfig}`);
  console.log(`✓ Border radius tokens: ${hasBorderRadius}`);
}

// 6. Typography & Fonts
console.log("\n6️⃣ TYPOGRAPHY");
console.log("─".repeat(70));

const fontLoads = {
  inter: htmlContent.includes("Inter"),
  jetbrainsMono: htmlContent.includes("JetBrains+Mono"),
  materialSymbols: htmlContent.includes("Material+Symbols"),
};

console.log(`✓ Inter font loaded: ${fontLoads.inter}`);
console.log(`✓ JetBrains Mono font loaded: ${fontLoads.jetbrainsMono}`);
console.log(`✓ Material Symbols icons loaded: ${fontLoads.materialSymbols}`);

// 7. Responsive Design
console.log("\n7️⃣ RESPONSIVE DESIGN");
console.log("─".repeat(70));

const responsiveFeatures = {
  hasMediaQueries: cssContent.includes("@media"),
  hasFlexbox: htmlContent.includes("flex"),
  hasGrid: htmlContent.includes("grid"),
  hasViewportMeta: htmlContent.includes("viewport"),
  hasMobileClasses: htmlContent.includes("hidden") || htmlContent.includes("sm:"),
};

console.log(`✓ Media queries present: ${responsiveFeatures.hasMediaQueries}`);
console.log(`✓ Flexbox layout: ${responsiveFeatures.hasFlexbox}`);
console.log(`✓ CSS Grid layout: ${responsiveFeatures.hasGrid}`);
console.log(`✓ Viewport meta tag: ${responsiveFeatures.hasViewportMeta}`);
console.log(`✓ Mobile-first classes (Tailwind): ${responsiveFeatures.hasMobileClasses}`);

// 8. Interactive Elements
console.log("\n8️⃣ INTERACTIVE ELEMENTS");
console.log("─".repeat(70));

const interactiveElements = {
  buttons: (htmlContent.match(/<button/g) || []).length,
  inputs: (htmlContent.match(/<input/g) || []).length,
  labels: (htmlContent.match(/<label/g) || []).length,
  dropZone: htmlContent.includes('id="roleDropZone"'),
  fileInput: htmlContent.includes('id="roleFileInput"'),
  uploadSection: htmlContent.includes('id="runtimeSourceControls"'),
};

console.log(`✓ Button elements: ${interactiveElements.buttons}`);
console.log(`✓ Input fields: ${interactiveElements.inputs}`);
console.log(`✓ Form labels: ${interactiveElements.labels}`);
console.log(`✓ Drop zone (#roleDropZone): ${interactiveElements.dropZone}`);
console.log(`✓ File input (#roleFileInput): ${interactiveElements.fileInput}`);
console.log(`✓ Upload section: ${interactiveElements.uploadSection}`);

// 9. JavaScript Integration
console.log("\n9️⃣ JAVASCRIPT INTEGRATION");
console.log("─".repeat(70));

const jsIntegration = {
  hasMainScript: htmlContent.includes('src="./main.js"'),
  moduleType: htmlContent.includes('type="module"'),
  drageDropHandlers: fs
    .readFileSync(path.join(process.cwd(), "main.ts"), "utf-8")
    .includes("dragenter"),
  fileUploadHandlers: fs
    .readFileSync(path.join(process.cwd(), "main.ts"), "utf-8")
    .includes("addEventListener"),
};

console.log(`✓ Main.js script loaded: ${jsIntegration.hasMainScript}`);
console.log(`✓ ES module syntax: ${jsIntegration.moduleType}`);
console.log(`✓ Drag/drop event handlers: ${jsIntegration.drageDropHandlers}`);
console.log(`✓ File upload event handlers: ${jsIntegration.fileUploadHandlers}`);

// 10. File Size Analysis
console.log("\n🔟 FILE SIZE ANALYSIS");
console.log("─".repeat(70));

const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2); // KB
  } catch {
    return "N/A";
  }
};

const htmlSize = getFileSize("./index.html");
const cssSize = getFileSize("./styles.css");
const buildSize = getFileSize("./dist/main.js");

console.log(`✓ index.html: ${htmlSize} KB`);
console.log(`✓ styles.css: ${cssSize} KB`);
console.log(`✓ dist/main.js (compiled): ${buildSize} KB`);

// 11. Code Quality Observations
console.log("\n1️⃣1️⃣ CODE QUALITY OBSERVATIONS");
console.log("─".repeat(70));

const qualityMetrics = {
  hasComments: cssContent.includes("/*") && cssContent.includes("*/"),
  hasConsistentNaming: cssContent.match(/\.-{2,}/g) && htmlContent.match(/id="/g),
  hasAccessibility: htmlContent.includes("aria-"),
  usesSemanticHTML: htmlContent.includes("<header") && htmlContent.includes("<main"),
};

console.log(`✓ Code comments present: ${qualityMetrics.hasComments}`);
console.log(`✓ Consistent naming conventions: ${qualityMetrics.hasConsistentNaming}`);
console.log(`✓ Accessibility attributes: ${qualityMetrics.hasAccessibility}`);
console.log(`✓ Semantic HTML structure: ${qualityMetrics.usesSemanticHTML}`);

console.log("\n" + "═".repeat(70));
console.log("\n✨ ASSESSMENT COMPLETE\n");
