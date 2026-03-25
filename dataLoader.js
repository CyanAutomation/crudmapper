import { normalizeRole } from "./parser.js";

const DEFAULT_ROLE_MANIFEST_URL = "./data/roles.manifest.json";

export async function resolveRoleFiles(discoveryInput = DEFAULT_ROLE_MANIFEST_URL) {
  if (Array.isArray(discoveryInput)) {
    return discoveryInput;
  }

  const manifestUrl = discoveryInput;
  const resp = await fetch(manifestUrl);
  if (!resp.ok) {
    throw new Error(`Failed to load role manifest ${manifestUrl}: HTTP ${resp.status}`);
  }

  const manifest = await resp.json();
  const filesValue = Array.isArray(manifest) ? manifest : manifest?.files;
  if (!Array.isArray(filesValue)) {
    const observedType = filesValue === null ? "null" : typeof filesValue;
    throw new Error(`Schema mismatch in manifest ${manifestUrl}: expected an array or { files: [] }, got ${observedType}`);
  }

  return filesValue.map((file, index) => {
    if (typeof file !== "string") {
      const observedType = file === null ? "null" : Array.isArray(file) ? "array" : typeof file;
      throw new Error(`Schema mismatch in manifest ${manifestUrl}: expected files[${index}] to be a string, got ${observedType}`);
    }

    return new URL(file, manifestUrl).toString();
  });
}

export async function loadAllRoles(discoveryInput = DEFAULT_ROLE_MANIFEST_URL) {
  const files = await resolveRoleFiles(discoveryInput);

  const roles = [];
  const errors = [];

  for (const file of files) {
    try {
      const resp = await fetch(file);
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
