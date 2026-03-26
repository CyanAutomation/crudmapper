# crudmapper

## What this project does

`crudmapper` is a role permission explorer UI for inspecting role JSON files. It helps you browse roles, open a role, and quickly understand which permissions are enabled across CRUD operations.

## Who this is for

This is for teams that need to analyze role JSON permissions (for example, admins, implementers, and auditors reviewing access models).

## Key features

- Sidebar groups roles by role area (via `groupByArea` in `dataLoader.ts`).
- Role detail view includes a permission search box and filtered permission rendering (via `renderRole` and `renderPermissionList` in `uiRoleView.ts`).
- CRUD badge visualization per permission using C/R/U/D cells.
- Permission categorization driven by `categoryMap.ts`.
- Local JSON loading through file upload and drag-and-drop in the browser UI (`index.html` and `main.ts`).
- **Full TypeScript support** with strict type checking.

## Architecture note

This is a client-side app. There is no backend service in this repository.

## Technology Stack

- **TypeScript 5.3+** for type-safe development
- **Vitest** for testing
- **ES2020 modules** compiled from TypeScript to JavaScript
- **Static deployment** to Vercel (no build step required for deployment)

## Project structure

- `main.ts`: Application bootstrap and UI event wiring (file upload, drag-and-drop, and view updates).
- `dataLoader.ts`: Source discovery, manifest resolution, and role normalization before rendering.
- `parser.ts`: Permission parsing and CRUD normalization utilities used by the role view.
- `categoryMap.ts`: Permission categorization logic for grouping and labeling permissions.
- `uiSidebar.ts` and `uiRoleView.ts`: UI rendering for the role list/sidebar and the role detail/permission panels.
- `types.ts`: Shared TypeScript type definitions for roles, permissions, and errors.
- `dist/`: Compiled JavaScript output (generated from TypeScript sources).

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build       # Compile TypeScript to dist/
```

### Type checking

```bash
npm run type-check  # Run type checker without emitting
```

### Testing

```bash
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once and exit
```

### Development mode

```bash
npm run dev         # Compile with --watch flag
```

## Validation & Testing

The repository includes comprehensive Vitest tests for core functionality:

```
tests/
├── categoryMap.validation.ts                           # Category matching
├── dataLoader.resolveRoleFiles.validation.ts          # Manifest resolution
├── parser.validation.ts                                # Permission parsing
├── researcher.normalization.validation.ts              # Role normalization
├── researcher.permission-format-variants.validation.ts # Format edge cases
├── researcher.rank-area-edges.validation.ts           # Area/rank edge cases
└── fixtures.structure.validation.ts                    # Data fixture validation
```

Run all tests:

```bash
npm run test:run
```

## Deploy to Vercel

This project is a static client-side app. The `dist/` folder contains compiled JavaScript generated from TypeScript sources.

### Pre-deployment

Before deploying, ensure TypeScript is compiled:

```bash
npm run build
```

This generates the `dist/` folder with compiled JavaScript, source maps, and type definitions. The `dist/` folder is excluded from version control (see `.gitignore`).

### Option 1: Deploy via Vercel UI

1. Sign in to Vercel and click **Add New... → Project**.
2. Import this repository.
3. In project settings, pick the framework preset **Other** or **Static**.
4. Set **Build Command** to `npm run build`.
5. Set **Output Directory** to `.` (repository root).
6. Deploy.

### Option 2: Deploy via Vercel CLI (optional)

From the repository root:

```bash
vercel
vercel --prod
```

Suggested CLI answers/settings:

- Framework preset: `Other`/`Static`
- Build command: `npm run build`
- Output directory: `.`

### `vercel.json` behavior

This repository includes a minimal `vercel.json` with `version: 2` and default static routing.

- No SPA fallback route is enabled by default.
- If you later want SPA fallback behavior, add a catch-all rewrite to `/index.html`.
- Static files under `/data`, `/design`, and root-level files are served as-is under default static behavior.

### Post-deploy verification checklist

After deployment, verify:

- The page loads successfully at the deployment URL.
- Role JSON files can be uploaded through the UI (file picker and/or drag-and-drop).
- Default manifest-backed role data loads from `data/roles.manifest.json`.

