import { normalizeRole } from "./parser.js";

const DEFAULT_ROLE_MANIFEST_URL = "./data/roles.manifest.json";

function createSchemaError(file, detail) {
  return {
    type: "schema_mismatch",
    file,
    message: `Schema mismatch in ${file}: ${detail}`,
  };
}

function createLoadError(source, type, message) {
  return {
    source,
    type,
    message,
  };
}

export function extractRoles(json, file) {
  const rolesValue = Array.isArray(json) ? json : json?.Roles;

  if (!Array.isArray(rolesValue)) {
    const observedType = rolesValue === null ? "null" : typeof rolesValue;
    return {
      error: createSchemaError(file, `expected an array or { Roles: [] }, got ${observedType}`),
    };
  }

  return { roles: rolesValue };
}

function resolveDiscoveryInput(discoveryInput) {
  if (Array.isArray(discoveryInput)) {
    return discoveryInput;
  }

  if (typeof discoveryInput === "string" && discoveryInput.length > 0) {
    return discoveryInput;
  }

  if (discoveryInput && typeof discoveryInput === "object") {
    if (Array.isArray(discoveryInput.roleFiles)) {
      return discoveryInput.roleFiles;
    }

    if (typeof discoveryInput.manifestPath === "string" && discoveryInput.manifestPath.length > 0) {
      return discoveryInput.manifestPath;
    }
  }

  return DEFAULT_ROLE_MANIFEST_URL;
}

export async function resolveRoleFiles(discoveryInput = DEFAULT_ROLE_MANIFEST_URL) {
  const resolvedDiscoveryInput = resolveDiscoveryInput(discoveryInput);

  if (Array.isArray(resolvedDiscoveryInput)) {
    return resolvedDiscoveryInput;
  }

  const manifestUrl = resolvedDiscoveryInput;
  try {
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
  } catch (err) {
    throw new Error(`Failed to process manifest ${manifestUrl}: ${err.message}`);
  }
}

export async function loadAllRoles(discoveryInput = DEFAULT_ROLE_MANIFEST_URL) {
  const resolvedDiscoveryInput = resolveDiscoveryInput(discoveryInput);
  let files;
  try {
    files = await resolveRoleFiles(resolvedDiscoveryInput);
  } catch (err) {
    console.warn(`Failed to resolve role files from ${resolvedDiscoveryInput}`, err);
    return {
      roles: [],
      errors: [
        createLoadError(
          String(resolvedDiscoveryInput),
          "source_resolution_failed",
          err?.message || "Failed to resolve role source configuration",
        ),
      ],
    };
  }

  const roles = [];
  const errors = [];

  for (const file of files) {
    try {
      const resp = await fetch(file);
      if (!resp.ok) {
        errors.push(createLoadError(file, "http_error", `HTTP ${resp.status}`));
        continue;
      }

      const json = await resp.json();
      const normalizedRoles = normalizeExtractedRoles(json, file);
      roles.push(...normalizedRoles);
    } catch (err) {
      console.warn(`Failed to load ${file}`, err);
      errors.push(
        createLoadError(
          file,
          err?.type || "load_failed",
          err?.message || "Failed to load role file"
        )
      );
    }
  }

  return { roles, errors };
}

export async function loadRolesFromFiles(files) {
  const roles = [];
  const errors = [];

  for (const file of files) {
    const source = file?.name || "local-file";
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const normalizedRoles = normalizeExtractedRoles(json, source);
      roles.push(...normalizedRoles);
    } catch (err) {
      console.warn(`Failed to load ${source}`, err);
      const errorType = err instanceof SyntaxError ? "json_parse_error" : err?.type || "load_failed";
      errors.push(createLoadError(source, errorType, err?.message || "Failed to load role file"));
    }
  }

  return { roles, errors };
}

function normalizeExtractedRoles(json, source) {
  const extractedRoles = extractRoles(json, source);
  if (extractedRoles.error) {
    const error = new Error(extractedRoles.error.message);
    error.type = extractedRoles.error.type;
    throw error;
  }

  return extractedRoles.roles.map((role, index) => {
    if (!role || typeof role !== "object" || Array.isArray(role)) {
      const observedType = role === null ? "null" : Array.isArray(role) ? "array" : typeof role;
      const error = new Error(`Schema mismatch in ${source}: expected Roles[${index}] to be a non-null object, got ${observedType}`);
      error.type = "schema_mismatch";
      throw error;
    }
    return normalizeRole(role);
  });
}

export function groupByArea(roles) {
  const map = {};
  for (const role of roles) {
    if (!map[role.Area]) map[role.Area] = [];
    map[role.Area].push(role);
  }
  return map;
}
