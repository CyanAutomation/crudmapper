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
      const rolesValue = json?.Roles;
      if (!Array.isArray(rolesValue)) {
        const observedType = rolesValue === null ? "null" : Array.isArray(rolesValue) ? "array" : typeof rolesValue;
        throw new Error(`Schema mismatch in ${file}: expected Roles to be an array, got ${observedType}`);
      }

      const normalizedRoles = rolesValue.map((role, index) => {
        if (!role || typeof role !== "object" || Array.isArray(role)) {
          const observedType = role === null ? "null" : Array.isArray(role) ? "array" : typeof role;
          throw new Error(`Schema mismatch in ${file}: expected Roles[${index}] to be a non-null object, got ${observedType}`);
        }
        return normalizeRole(role);
      });

      roles.push(...normalizedRoles);
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