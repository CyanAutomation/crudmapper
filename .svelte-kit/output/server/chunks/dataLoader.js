function parsePermission(raw) {
  if (!raw || typeof raw !== "string") {
    return { name: "", canonicalName: "", crud: "" };
  }
  try {
    const normalizeCrud = (value) => {
      if (!value) return "";
      const withCanonicalWords = value.replace(/\b(create)\b/gi, "C").replace(/\b(read)\b/gi, "R").replace(/\b(update)\b/gi, "U").replace(/\b(delete)\b/gi, "D");
      const crudTokenPattern = /(?:^|[^A-Z0-9])([CRUD](?:[\s,;:|/-]*[CRUD])*)(?=$|[^A-Z0-9])/gi;
      const discovered = /* @__PURE__ */ new Set();
      let match;
      while (match = crudTokenPattern.exec(withCanonicalWords.toUpperCase())) {
        if (match.index === crudTokenPattern.lastIndex) {
          crudTokenPattern.lastIndex++;
        }
        match[1].replace(/[^CRUD]/g, "").split("").forEach((token) => discovered.add(token));
      }
      return "CRUD".split("").filter((token) => discovered.has(token)).join("");
    };
    const stripTrailingCrudTokens = (value) => {
      const trailingCrudWordsPattern = /([\s\-:|/,()\\]+(?:(?:create|read|update|delete)(?:[\s,;:|/\-\\]+|$)){1,4}\s*[)\]]?)$/i;
      const trailingCrudLettersPattern = /([\s\-:|/,()\\]+(?:[CRUD](?:[\s,;:|/\-\\]*[CRUD])*)\s*[)\]]?)$/i;
      const withoutWords = value.replace(trailingCrudWordsPattern, "");
      const withoutLetters = withoutWords.replace(trailingCrudLettersPattern, "");
      const normalized = withoutLetters.trim().replace(/\s+/g, " ");
      return normalized || value.trim().replace(/\s+/g, " ");
    };
    const cleaned = raw.replace(/\r/g, "").trim();
    const lines = cleaned.split("\n");
    const nonEmptyLineIndex = lines.findIndex((line) => line.trim());
    const nonEmptyLine = nonEmptyLineIndex >= 0 ? lines[nonEmptyLineIndex] : void 0;
    const rawName = (nonEmptyLine ?? lines[0] ?? "").trim();
    const name = stripTrailingCrudTokens(rawName);
    const canonicalName = name.toLowerCase();
    if (!name) {
      return { name: "", canonicalName: "", crud: "" };
    }
    const crud = normalizeCrud(cleaned);
    return { name, canonicalName, crud };
  } catch {
    return { name: "", canonicalName: "", crud: "" };
  }
}
function normalizeRole(role) {
  const roleObj = role;
  const normalizedPermissions = Array.isArray(roleObj?.Permissions) ? roleObj.Permissions : [];
  const normalizedActions = Array.isArray(roleObj?.Actions) ? roleObj.Actions : [];
  const normalizedNavigation = Array.isArray(roleObj?.Navigation) ? roleObj.Navigation : [];
  const normalizedArea = typeof roleObj?.Area === "string" && roleObj.Area.trim().length > 0 ? roleObj.Area : "Unassigned";
  const normalizedRank = Number.isFinite(roleObj?.Rank) ? roleObj.Rank : 0;
  const normalizedFriendlyName = typeof roleObj?.FriendlyName === "string" && roleObj.FriendlyName.trim().length > 0 ? roleObj.FriendlyName : roleObj?.Name || "Unnamed Role";
  const permissionMap = {};
  const permissionLabels = {};
  normalizedPermissions.forEach((raw) => {
    const { name, canonicalName, crud } = parsePermission(raw);
    if (!canonicalName) return;
    if (!permissionMap[canonicalName]) {
      permissionMap[canonicalName] = /* @__PURE__ */ new Set();
      permissionLabels[canonicalName] = name;
    }
    crud.split("").forEach((letter) => permissionMap[canonicalName].add(letter));
  });
  return {
    ...roleObj,
    Permissions: normalizedPermissions,
    Actions: normalizedActions,
    Navigation: normalizedNavigation,
    Area: normalizedArea,
    Rank: normalizedRank,
    FriendlyName: normalizedFriendlyName,
    NormalizedPermissions: permissionMap,
    PermissionLabels: permissionLabels,
    _cachedCategories: null
  };
}
const DEFAULT_ROLE_MANIFEST_URL = "./data/roles.manifest.json";
function createSchemaError(file, detail) {
  return {
    type: "schema_mismatch",
    source: file,
    message: `Schema mismatch in ${file}: ${detail}`
  };
}
function createLoadError(source, type, message) {
  return {
    source,
    type,
    message
  };
}
function extractRoles(json, file) {
  const rolesValue = Array.isArray(json) ? json : json?.Roles;
  if (!Array.isArray(rolesValue)) {
    const observedType = rolesValue === null ? "null" : typeof rolesValue;
    return {
      error: createSchemaError(file, `expected an array or { Roles: [] }, got ${observedType}`)
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
    const discObj = discoveryInput;
    if (Array.isArray(discObj.roleFiles)) {
      return discObj.roleFiles;
    }
    if (typeof discObj.manifestPath === "string" && discObj.manifestPath.length > 0) {
      return discObj.manifestPath;
    }
  }
  return DEFAULT_ROLE_MANIFEST_URL;
}
async function resolveRoleFiles(discoveryInput = DEFAULT_ROLE_MANIFEST_URL) {
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
    const absoluteManifestUrl = resolveAbsoluteManifestUrl(manifestUrl, resp.url);
    const filesValue = Array.isArray(manifest) ? manifest : manifest?.files;
    if (!Array.isArray(filesValue)) {
      const observedType = filesValue === null ? "null" : typeof filesValue;
      throw new Error(
        `Schema mismatch in manifest ${manifestUrl}: expected an array or { files: [] }, got ${observedType}`
      );
    }
    return filesValue.map((file, index) => {
      if (typeof file !== "string") {
        const observedType = file === null ? "null" : Array.isArray(file) ? "array" : typeof file;
        throw new Error(
          `Schema mismatch in manifest ${manifestUrl}: expected files[${index}] to be a string, got ${observedType}`
        );
      }
      return new URL(file, absoluteManifestUrl).toString();
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to process manifest ${manifestUrl}: ${errMsg}`);
  }
}
function resolveAbsoluteManifestUrl(manifestUrl, responseUrl) {
  if (typeof responseUrl === "string" && responseUrl.length > 0) {
    try {
      return new URL(responseUrl).toString();
    } catch {
    }
  }
  const locationHref = globalThis?.window?.location?.href;
  if (typeof locationHref === "string" && locationHref.length > 0) {
    return new URL(manifestUrl, locationHref).toString();
  }
  return new URL(manifestUrl, "http://localhost/").toString();
}
async function loadAllRoles(discoveryInput = DEFAULT_ROLE_MANIFEST_URL) {
  const resolvedDiscoveryInput = resolveDiscoveryInput(discoveryInput);
  let files;
  try {
    files = await resolveRoleFiles(resolvedDiscoveryInput);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Failed to resolve role source configuration";
    console.warn(`Failed to resolve role files from ${resolvedDiscoveryInput}`, err);
    return {
      roles: [],
      errors: [createLoadError(String(resolvedDiscoveryInput), "source_resolution_failed", errMsg)]
    };
  }
  const roles = [];
  const errors = [];
  for (const file of files) {
    try {
      const resp = await fetch(file);
      if (!resp.ok) {
        errors.push(createLoadError(file, "fetch_error", `HTTP ${resp.status}`));
        continue;
      }
      const json = await resp.json();
      const normalizedRoles = normalizeExtractedRoles(json, file);
      roles.push(...normalizedRoles);
    } catch (err) {
      const errType = err instanceof Error && "type" in err ? err.type : "parse_error";
      const errMsg = err instanceof Error ? err.message : "Failed to load role file";
      console.warn(`Failed to load ${file}`, err);
      errors.push(createLoadError(file, errType, errMsg));
    }
  }
  return { roles, errors };
}
function normalizeExtractedRoles(json, source) {
  const extractedRoles = extractRoles(json, source);
  if ("error" in extractedRoles) {
    const error = new Error(extractedRoles.error.message);
    error.type = extractedRoles.error.type;
    throw error;
  }
  return extractedRoles.roles.map((role, index) => {
    if (!role || typeof role !== "object" || Array.isArray(role)) {
      const observedType = role === null ? "null" : Array.isArray(role) ? "array" : typeof role;
      const error = new Error(
        `Schema mismatch in ${source}: expected Roles[${index}] to be a non-null object, got ${observedType}`
      );
      error.type = "schema_mismatch";
      throw error;
    }
    return normalizeRole(role);
  });
}
function groupByArea(roles) {
  const result = {};
  for (const role of roles) {
    const area = role?.Area;
    const normalizedArea = typeof area === "string" && area.length > 0 ? area : "Unassigned";
    if (!result[normalizedArea]) {
      result[normalizedArea] = [];
    }
    result[normalizedArea].push(role);
  }
  return result;
}
export {
  groupByArea as g,
  loadAllRoles as l
};
