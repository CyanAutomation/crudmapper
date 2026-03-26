# crudmapper

## What this project does

`crudmapper` is a role permission explorer UI for inspecting role JSON files. It helps you browse roles, open a role, and quickly understand which permissions are enabled across CRUD operations.

## Who this is for

This is for teams that need to analyze role JSON permissions (for example, admins, implementers, and auditors reviewing access models).

## Key features

- Sidebar groups roles by role area (via `groupByArea` in `dataLoader.js`).
- Role detail view includes a permission search box and filtered permission rendering (via `renderRole` and `renderPermissionList` in `uiRoleView.js`).
- CRUD badge visualization per permission using C/R/U/D cells.
- Permission categorization driven by `categoryMap.js`.
- Local JSON loading through file upload and drag-and-drop in the browser UI (`index.html` and `main.js`).

## Architecture note

This is a client-side app. There is no backend service in this repository.

## Project structure

- `main.js`: Application bootstrap and UI event wiring (file upload, drag-and-drop, and view updates).
- `dataLoader.js`: Source discovery, manifest resolution, and role normalization before rendering.
- `parser.js`: Permission parsing and CRUD normalization utilities used by the role view.
- `categoryMap.js`: Permission categorization logic for grouping and labeling permissions.
- `uiSidebar.js` and `uiRoleView.js`: UI rendering for the role list/sidebar and the role detail/permission panels.

## Validation

The repository includes standalone Node validation scripts for core parsing and categorization behavior:

- `tests/parser.validation.mjs`
- `tests/categoryMap.validation.mjs`

Example commands (run from the repository root):

```bash
node tests/parser.validation.mjs
node tests/categoryMap.validation.mjs
```

## Deploy to Vercel

This project is a static client-side app, so deploy it as a static site with no build step.

### Option 1: Deploy via Vercel UI

1. Sign in to Vercel and click **Add New... → Project**.
2. Import this repository.
3. In project settings, pick the framework preset **Other** or **Static**.
4. Set **Build Command** to none (leave blank).
5. Set **Output Directory** to `.` (repository root).
6. Deploy.

### Option 2: Deploy via Vercel CLI (optional)

From the repository root:

```bash
vercel
vercel --prod
```

Suggested CLI answers/settings should match UI settings:

- Framework preset: `Other`/`Static`
- Build command: none
- Output directory: `.`

### `vercel.json` behavior

This repository includes a minimal `vercel.json` with `version: 2` and default static routing.

- No SPA fallback route is enabled by default.
- If you later want SPA fallback behavior, add a catch-all rewrite to `/index.html`.
- Static files under `/data`, `/design`, and root-level JS/CSS files are served as-is under default static behavior.

### Post-deploy verification checklist

After deployment, verify:

- The page loads successfully at the deployment URL.
- Role JSON files can be uploaded through the UI (file picker and/or drag-and-drop).
- Default manifest-backed role data loads from `data/roles.manifest.json`.

