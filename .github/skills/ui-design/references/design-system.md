# Design System Reference

## The Precision Architect Philosophy

The crudmapper UI implements **The Precision Architect** design system—a sophisticated, enterprise-grade aesthetic focused on:

- **Tonal Layering**: Multiple shades of color creating depth without relying on borders
- **Glassmorphism**: Backdrop filters and transparency for modern, sophisticated overlays
- **Editorial Typography**: Carefully selected typefaces for different contexts
- **Semantic Color**: Colors that convey meaning and role-specific operations
- **No-Line Minimalism**: Borders avoided in favor of subtle color and shadow differentiation

## Design Tokens

### Color System

The color palette follows a tonal approach with role-specific badges for CRUD operations.

#### Primary Colors

| Token                    | Usage                                    | Example Value                       |
| ------------------------ | ---------------------------------------- | ----------------------------------- |
| `--color-primary`        | Main brand color, call-to-action buttons | `#565e74` (sophisticated blue-gray) |
| `--color-surface`        | Backgrounds, cards, elevated surfaces    | `#f5f7fa` (light neutral)           |
| `--color-background`     | Page background                          | `#ffffff` (white) or `#fafbfc`      |
| `--color-text`           | Primary text content                     | `#1a202c` (dark gray)               |
| `--color-text-secondary` | Secondary text, metadata                 | `#718096` (medium gray)             |
| `--color-border`         | Subtle borders and dividers              | `#e2e8f0` (light gray)              |

#### CRUD Badge Colors

Role-specific badges use semantic colors to indicate operation types:

| Operation      | Color                    | Usage                              |
| -------------- | ------------------------ | ---------------------------------- |
| **Create (C)** | Green (`#10b981`)        | Permission to create/add new items |
| **Read (R)**   | Blue (`#3b82f6`)         | Permission to view/read items      |
| **Update (U)** | Yellow/Amber (`#f59e0b`) | Permission to edit/modify items    |
| **Delete (D)** | Red (`#ef4444`)          | Permission to remove/delete items  |

Example styling might use: `badge--crud-create`, `badge--crud-read`, etc.

#### Shadow System

| Token         | Usage                   | Approximate Value                  |
| ------------- | ----------------------- | ---------------------------------- |
| `--shadow-sm` | Subtle elevation        | `0 1px 2px 0 rgba(0,0,0,0.05)`     |
| `--shadow-md` | Standard elevation      | `0 4px 6px -1px rgba(0,0,0,0.1)`   |
| `--shadow-lg` | Prominent elevation     | `0 10px 15px -3px rgba(0,0,0,0.1)` |
| `--shadow-xl` | Modal/overlay elevation | `0 20px 25px -5px rgba(0,0,0,0.1)` |

### Typography

#### Font Families

| Font               | Usage                                | Weight Range       |
| ------------------ | ------------------------------------ | ------------------ |
| **Inter**          | UI text, labels, buttons, body copy  | 400, 500, 600, 700 |
| **JetBrains Mono** | Code, technical strings, identifiers | 400, 600           |

#### Font Sizes

Standard scale (following a 4px base):

```
--text-xs:   0.75rem  (12px)   # Secondary labels, captions
--text-sm:   0.875rem (14px)   # Form labels, hints
--text-base: 1rem     (16px)   # Body text, standard UI
--text-lg:   1.125rem (18px)   # Section headers
--text-xl:   1.25rem  (20px)   # Component titles
--text-2xl:  1.5rem   (24px)   # Page titles
--text-3xl:  1.875rem (30px)   # Main headings
```

#### Line Heights

- Body text: 1.5 (24px)
- Headings: 1.2 (tight)
- UI elements: 1.4 (comfortable)

### Spacing Scale

Used for padding, margin, and gaps:

```
--spacing-xs:   0.25rem  (4px)   # Tight grouping
--spacing-sm:   0.5rem   (8px)   # Small spacing
--spacing-base: 1rem     (16px)  # Standard spacing
--spacing-lg:   1.5rem   (24px)  # Large spacing
--spacing-xl:   2rem     (32px)  # Extra large
--spacing-2xl:  3rem     (48px)  # Page sections
```

### Border Radius

Following a gradual curve progression:

```
--radius-sm:   0.25rem (4px)     # Slight curve
--radius-md:   0.375rem (6px)    # Standard radius
--radius-lg:   0.5rem (8px)      # Rounded corners
--radius-full: 9999px            # Fully rounded
```

## Visual Guidelines

### Elevation & Depth

Pages use tonal layering to define hierarchy:

1. **Background** (`--color-background`): Page base
2. **Surface** (`--color-surface`): Cards, panels, elevated sections
3. **Interactive** (`--color-primary`): Buttons, links, focus states
4. **Overlay**: Semi-transparent with backdrop blur (glassmorphism)

### Layout Breakpoints

Responsive design uses these standard breakpoints:

| Breakpoint | Width  | Device            |
| ---------- | ------ | ----------------- |
| Mobile     | 375px  | Small phones      |
| Tablet     | 768px  | iPad / Tablets    |
| Desktop    | 1440px | Standard monitors |
| Large      | 1920px | Wide screens      |

### Component Patterns

#### Buttons

- **Primary**: `--color-primary` background, white text
- **Secondary**: `--color-surface` background, `--color-text` text, subtle border
- **Danger**: Red background for delete/remove actions
- **Minimum size**: 44×44px (accessibility/touch targets)

#### Cards

- Background: `--color-surface`
- Padding: `--spacing-base` (16px)
- Shadow: `--shadow-md`
- Border-radius: `--radius-md`
- Border: None (uses shadow for elevation)

#### Form Elements

- Label text: `--text-sm`, `--color-text`
- Input background: White or `--color-background`
- Input border: 1px solid `--color-border`
- Focus state: Blue outline or border change
- Minimum height: 44px (including padding)

#### Role Detail Views

- Hero section with role name and description
- CRUD badges (Create, Read, Update, Delete) in semantic colors
- Associated researchers or teams below
- Edit/delete action buttons aligned to guidelines

## Glassmorphism Effects

Used for overlays, modals, and floating panels:

```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

This creates:

- Frosted glass appearance
- Semi-transparent overlay
- Subtle white border for definition
- Blur effect on content behind

## Accessibility Considerations

- **Color Contrast**: Text must meet WCAG AA standards (4.5:1 for normal text)
- **Color Alone**: Never rely solely on color to convey information; use icons, text labels, or patterns
- **Focus States**: Keyboard-navigable elements must have visible focus indicators
- **Touch Targets**: Interactive elements minimum 44×44px (iOS) or 48×48dp (Material Design)
- **Semantic HTML**: Use proper heading hierarchy, form labels, ARIA attributes
- **Typography Color**: Ensure adequate contrast for secondary text

## Animation & Transitions

While not explicitly configured in this reference, maintain:

- **Micro-interactions**: 200-300ms duration for hover/focus states
- **Page transitions**: 300-500ms for navigation
- **Avoid flashing**: Keep animations smooth and deliberate
- **Respect prefers-reduced-motion**: Disable animations for users who request it

## Example: CRUD Badge HTML

```html
<!-- Create Permission Badge -->
<span class="badge badge--crud badge--crud-create" role="img" aria-label="Create permission">
  C
</span>

<!-- With styling -->
<style>
  .badge--crud-create {
    background-color: #10b981; /* Green */
    color: white;
    padding: var(--spacing-sm) var(--spacing-base);
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: var(--text-sm);
  }
</style>
```

## Further Reading

- See [root DESIGN.md](../../design/DESIGN.md) for visual examples and component layouts
- Check [UI-ASSESSMENT.md](../../UI-ASSESSMENT.md) for current implementation status
- Review [tailwind.config.ts](../../tailwind.config.ts) for Tailwind token configuration
