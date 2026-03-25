import { normalizeRole } from "./parser.js";

export async function loadAllRoles() {
  const files = [
    "administrator.json",
    "clients.json",
    "customerservices.json",
    "finance.json",
    "maintenance.json",
    "operations.json",
    "reportcentre.json",
    "sales.json",
    "systemadmin.json",
    "training.json"
  ];

  const roles = [];
  const errors = [];

  for (const file of files) {
    try {
      const resp = await fetch(`./data/${file}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json = await resp.json();
      if (!json.Roles) throw new Error("Invalid JSON format");

      roles.push(...json.Roles.map(normalizeRole));
    } catch (err) {
      console.warn(`Failed to load ${file}`, err);
      errors.push(file);
    }
  }

  return { roles, errors };
}

export function groupByArea(roles) {
  const map = {};
  for (const role of roles) {
    if (!map[role.Area]) map[role.Area] = [];
    map[role.Area].push(role);
  }
  return map;
}