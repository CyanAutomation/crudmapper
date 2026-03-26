---
name: ui-design
description: "Validate UI design system compliance using playwright-cli. Use when: verifying design tokens, color system accuracy, responsive layout behavior, CSS variable consistency, heading hierarchy, visual structure across viewports. Test against 'The Precision Architect' design system."
argument-hint: "Optional arguments: viewport (mobile|tablet|desktop), output-format (json|readable), target-url (default: http://localhost:8000)"
user-invocable: true
---

# UI Design Validation with Playwright

Automated design system compliance testing using @playwright/test. Verifies design tokens, color accuracy, responsive breakpoints, and visual structure against The Precision Architect design philosophy.

## When to Use

Use this skill when:

- Validating design token consistency (CSS variables, colors, spacing)
- Verifying responsive layout across mobile (375px), tablet (768px), desktop (1440px) viewports
- Checking CRUD badge color accuracy and styling
- Ensuring typography compliance (font families, sizes, weights)
- Validating heading hierarchy and semantic HTML structure
- Verifying accessibility attributes (aria-label, role, heading levels)
- Testing glassmorphism effects, shadows, and visual effects
- Debugging design system implementation before committing changes

## Quick Start

### 1. Setup Environment (First Time)

Run [setup-playwright.js](./scripts/setup-playwright.js) to validate and prepare the test environment:

```bash
node .github/skills/ui-design/scripts/setup-playwright.js
```

This will:

- Verify @playwright/test is installed
- Install Playwright browsers if needed
- Check if localhost:8000 is accessible (suggests `npm run dev` if not)
- Display environment readiness status

### 2. Run Design Compliance Check

Execute [design-compliance-check.js](./scripts/design-compliance-check.js) to validate the entire design system:

```bash
node .github/skills/ui-design/scripts/design-compliance-check.js
```

Output includes:

- **Page Performance**: Load time and DOM metrics
- **Visual Structure**: Header, sidebar, main content visibility
- **Design Tokens**: CSS variable existence (--color-primary, --color-surface, etc.)
- **Typography**: Font imports and computed font families
- **Interactive Elements**: Button, form, input, upload control counts
- **Accessibility**: Heading structure, form labels, ARIA attributes
- **Dropzone**: File upload functionality and event handling

### 3. Test Responsive Design

Run [responsive-test.js](./scripts/responsive-test.js) to validate layout across viewports:

```bash
node .github/skills/ui-design/scripts/responsive-test.js [--viewport mobile|tablet|desktop]
```

Tests three standard breakpoints:

- **Mobile**: 375px width (for small phones)
- **Tablet**: 768px width (for iPad/tablets)
- **Desktop**: 1440px width (for standard monitors)

## Advanced Usage

### Custom Output Format

To get JSON output for programmatic processing:

```bash
node .github/skills/ui-design/scripts/design-compliance-check.js --format json
```

### Target Different URL

If your dev server runs on a different port:

```bash
node .github/skills/ui-design/scripts/design-compliance-check.js --url http://localhost:5173
```

### Create Custom Design Validations

Use [custom-validation-template.js](./assets/custom-validation-template.js) to extend the skill with project-specific assertions:

1. Copy the template to your project
2. Import [setup scripts](./scripts/setup-playwright.js) for browser launching
3. Define custom test cases (e.g., checking specific CSS variable values)
4. Run: `node your-custom-test.js`

See [Playwright Usage Guide](./references/playwright-usage-guide.md) for code patterns and examples.

## Design System Reference

The crudmapper interface follows **The Precision Architect** design philosophy:

- **Tonal layering** without borders for sophisticated, minimal aesthetics
- **Glassmorphism effects** with backdrop filters for depth
- **Editorial typography**: Inter for UI text, JetBrains Mono for technical strings
- **Color system**: Sophisticated palette with role-specific badges (green, blue, yellow, red for CRUD operations)
- **Semantic structure**: Proper heading hierarchy, labeled interactive elements, keyboard navigation support

View [Design System Reference](./references/design-system.md) for detailed token specifications and color mappings.

## Troubleshooting

| Issue                                 | Solution                                                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Port 8000 not accessible**          | Start dev server: `npm run dev` (runs on localhost:5173 by default, adjust target URL)                      |
| **Playwright browsers not installed** | Run setup script: `node .github/skills/ui-design/scripts/setup-playwright.js`                               |
| **"Cannot find module" errors**       | Verify node_modules installed: `npm install`                                                                |
| **Viewport test shows layout shift**  | Expected across responsive breakpoints; compare against design specs in [DESIGN.md](../../design/DESIGN.md) |
| **Color mismatches in output**        | Check CSS variable definitions in tailwind.config.ts and validate computed styles in browser DevTools       |
| **Heading validation fails**          | Review semantic HTML structure; ensure all page sections have proper h1-h6 hierarchy                        |

## Related Documentation

- [Design System Reference](./references/design-system.md) — CSS variables, colors, typography, spacing tokens
- [Playwright Usage Guide](./references/playwright-usage-guide.md) — CLI commands, custom assertions, browser launching patterns
- [root DESIGN.md](../../design/DESIGN.md) — Visual design specifications and component examples
- [root UI-ASSESSMENT.md](../../UI-ASSESSMENT.md) — Current UI assessment results and requirements
- [@playwright/test docs](https://playwright.dev/docs/intro) — Full Playwright API reference (external link)
