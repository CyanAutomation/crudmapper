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
