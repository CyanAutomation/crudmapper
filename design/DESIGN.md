# Design System Specification

## 1. Overview & Creative North Star: "The Precision Architect"

The objective of this design system is to transform a high-density technical auditing environment into a high-end editorial experience. We are moving away from the "standard dashboard" aesthetic. Instead, we embrace **The Precision Architect**—a North Star that treats data as structural elements in an architectural blueprint.

This system rejects the "boxed-in" feel of traditional pro-tools. We achieve clarity through intentional asymmetry, rigorous tonal layering, and an authoritative typographic hierarchy. By utilizing breathing room as a functional tool rather than a luxury, we ensure that the auditor’s cognitive load is reduced without sacrificing the information density required for deep-state technical mapping.

---

## 2. Colors: Tonal Authority

Our palette is anchored in a sophisticated range of slates and navies, designed to feel stable and permanent.

### The Palette

- **Primary (`#565e74`):** The core of the "pro-tool" look. Used for high-level navigational anchors and primary actions.
- **Surface Hierarchy:** We utilize the full spectrum of `surface_container` tokens to create depth.
  - `surface_container_lowest` (#ffffff) for the most elevated interactive elements (cards).
  - `surface` (#f7f9fb) for the global canvas.
  - `surface_dim` (#cfdce3) for sidebar background to provide a weighted, authoritative anchor.
- **CRUD Semantics (Distinctive Badges):**
  - **Create:** `crud_c_bg` (`#4ade80`) with `crud_c_fg` (`#0b2a16`).
  - **Read:** `crud_r_bg` (`#60a5fa`) with `crud_r_fg` (`#08233f`).
  - **Update:** `crud_u_bg` (`#facc15`) with `crud_u_fg` (`#3a2a00`).
  - **Delete:** `crud_d_bg` (`#f87171`) with `crud_d_fg` (`#3f0f0f`).
  - These tokens are intentionally more saturated than the general surface palette so C/R/U/D remain instantly scannable and visually distinct from one another.

### The "No-Line" Rule

To achieve a signature premium feel, **1px solid borders are strictly prohibited for sectioning.**

- Boundaries must be defined through background color shifts. For example, a `surface_container_low` data table should sit directly on a `surface` background.
- The transition of color alone is enough to define the "edge." This creates a seamless, fluid UI that feels integrated rather than fragmented.

### The "Glass & Gradient" Rule

Floating elements (modals, tooltips, or popovers) should use a subtle Glassmorphism effect:

- Apply `surface_bright` at 85% opacity with a `12px` backdrop blur.
- Use a subtle linear gradient on main CTAs: `primary` (#565e74) to `primary_dim` (#4a5268) at a 135-degree angle. This adds "soul" and prevents the interface from feeling flat and "template-like."

---

## 3. Typography: The Editorial Data Scale

We use **Inter** as our typographic workhorse. The goal is to balance the elegance of a broadsheet newspaper with the rigid precision of a technical manual.

- **Display & Headlines:** Use `display-sm` (2.25rem) for main dashboard headings. The scale should be aggressive to provide clear entry points into the data.
- **The Technical String:** For permission strings, UUIDs, and raw audit logs, use a **Monospaced Font** (e.g., JetBrains Mono or Roboto Mono) set at `label-md` (0.75rem). This differentiates "human-readable" data from "machine-readable" data.
- **Tabular Density:** Data tables should primarily utilize `body-sm` (0.75rem) to maximize information density while maintaining legibility through generous line-height (1.5).

---

## 4. Elevation & Depth: Tonal Layering

Depth in this system is not about height; it’s about **layering.**

- **The Layering Principle:** Stack surfaces to create focus. A `surface_container_lowest` card placed on a `surface_container_low` background creates a natural lift.
- **Ambient Shadows:** If an element must float (e.g., a primary navigation dropdown), use a shadow with a `24px` blur and `4%` opacity, using the `on_surface` color as the shadow tint. It should feel like a soft glow of light, not a dark drop shadow.
- **The Ghost Border Fallback:** Where accessibility requires a border (e.g., input fields), use a "Ghost Border." Apply the `outline_variant` token at **15% opacity**. It should be barely perceptible, serving as a suggestion of a boundary rather than a hard wall.

---

## 5. Components

### Searchable Data Tables

- **Rows:** Forbid the use of divider lines. Use alternating row colors between `surface_container_lowest` and `surface_container_low`.
- **Cells:** Use `body-sm` for text. For CRUD operations, use compact 'badge' style cells.
- **CRUD Badges:** Fixed-width, `label-sm` weight, with a `0.25rem` (DEFAULT) corner radius. Use the dedicated `crud_*` tokens so each badge remains clearly distinguishable at a glance while still harmonizing with the surrounding neutral surfaces.

### Sidebar Navigation

- **Background:** `surface_dim` (#cfdce3).
- **Active State:** No heavy background blocks. Use a 2px vertical "signature" line on the left using the `primary` color, and shift the text weight to `title-sm`.

### Input Fields

- **Style:** Minimalist. Use `surface_container_high` for the background and a "Ghost Border" at the bottom only.
- **States:** On focus, transition the bottom border to `primary` (#565e74) with a thickness of 2px.

### Buttons

- **Primary:** `primary` color with `on_primary` text. `0.375rem` (md) radius.
- **Secondary:** `secondary_container` background with `on_secondary_container` text.
- **Tertiary:** No background. `primary` text color with a high-opacity `surface_variant` on hover.

---

## 6. Do's and Don'ts

### Do

- **Do** use the Spacing Scale religiously. Consistent gaps (e.g., `8` for gutters, `4` for internal padding) create a mathematical rhythm that users feel subconsciously.
- **Do** use `label-sm` for metadata. Technical auditing requires knowing "when" and "who"—keep these small but high-contrast (`on_surface_variant`).
- **Do** use "Ghost Borders" for complex nested data structures where tonal shifts alone are insufficient.

### Don't

- **Don't** use 100% black text. Always use `on_surface` (#2a3439) for better optical comfort during long auditing sessions.
- **Don't** use "Standard" icons. Choose a light-weight (2pt stroke) icon set that matches the stroke weight of your Inter typography.
- **Don't** use heavy drop shadows on cards. Let the tonal background shifts do the heavy lifting for your hierarchy.
