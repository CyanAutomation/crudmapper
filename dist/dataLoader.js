import { normalizeRole } from "./parser.js";
const DEFAULT_ROLE_MANIFEST_URL = "./data/roles.manifest.json";
function createSchemaError(file, detail) {
    return {
        type: "schema_mismatch",
        source: file,
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
        const absoluteManifestUrl = resolveAbsoluteManifestUrl(manifestUrl, resp.url);
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
            return new URL(file, absoluteManifestUrl).toString();
        });
    }
    catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        throw new Error(`Failed to process manifest ${manifestUrl}: ${errMsg}`);
    }
}
function resolveAbsoluteManifestUrl(manifestUrl, responseUrl) {
    if (typeof responseUrl === "string" && responseUrl.length > 0) {
        try {
            return new URL(responseUrl).toString();
        }
        catch {
            // Fall back to location-based resolution below.
        }
    }
    const locationHref = globalThis?.window?.location?.href;
    if (typeof locationHref === "string" && locationHref.length > 0) {
        return new URL(manifestUrl, locationHref).toString();
    }
    return new URL(manifestUrl, "http://localhost/").toString();
}
export async function loadAllRoles(discoveryInput = DEFAULT_ROLE_MANIFEST_URL) {
    const resolvedDiscoveryInput = resolveDiscoveryInput(discoveryInput);
    let files;
    try {
        files = await resolveRoleFiles(resolvedDiscoveryInput);
    }
    catch (err) {
        const errMsg = err instanceof Error ? err.message : "Failed to resolve role source configuration";
        console.warn(`Failed to resolve role files from ${resolvedDiscoveryInput}`, err);
        return {
            roles: [],
            errors: [
                createLoadError(String(resolvedDiscoveryInput), "source_resolution_failed", errMsg),
            ],
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
        }
        catch (err) {
            const errType = err instanceof Error && "type" in err ? err.type : "parse_error";
            const errMsg = err instanceof Error ? err.message : "Failed to load role file";
            console.warn(`Failed to load ${file}`, err);
            errors.push(createLoadError(file, errType, errMsg));
        }
    }
    return { roles, errors };
}
function getManifestEntries(json) {
    if (Array.isArray(json)) {
        return json;
    }
    if (json && typeof json === "object") {
        const jsonObj = json;
        if (Array.isArray(jsonObj.files)) {
            return jsonObj.files;
        }
    }
    return null;
}
function basename(pathValue) {
    return String(pathValue).split(/[\\/]/).filter(Boolean).pop() || "";
}
export async function loadRolesFromFiles(files) {
    const roles = [];
    const errors = [];
    const parsedFiles = [];
    for (const file of files) {
        const source = file?.name || "local-file";
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            parsedFiles.push({ file, source, json });
        }
        catch (err) {
            console.warn(`Failed to load ${source}`, err);
            const errorType = err instanceof SyntaxError ? "parse_error" : "parse_error";
            const errMsg = err instanceof Error ? err.message : "Failed to load role file";
            errors.push(createLoadError(source, errorType, errMsg));
        }
    }
    const manifestEntry = parsedFiles.find(({ json }) => getManifestEntries(json) !== null);
    if (!manifestEntry) {
        for (const parsed of parsedFiles) {
            try {
                const normalizedRoles = normalizeExtractedRoles(parsed.json, parsed.source);
                roles.push(...normalizedRoles);
            }
            catch (err) {
                const errType = err instanceof Error && "type" in err ? err.type : "parse_error";
                const errMsg = err instanceof Error ? err.message : "Failed to load role file";
                console.warn(`Failed to normalize ${parsed.source}`, err);
                errors.push(createLoadError(parsed.source, errType, errMsg));
            }
        }
        return { roles, errors };
    }
    const manifestEntries = getManifestEntries(manifestEntry.json);
    if (!manifestEntries) {
        return { roles, errors };
    }
    const uploadMap = new Map();
    for (const parsed of parsedFiles) {
        if (parsed.source === manifestEntry.source) {
            continue;
        }
        if (!uploadMap.has(parsed.source)) {
            uploadMap.set(parsed.source, parsed);
        }
    }
    for (let index = 0; index < manifestEntries.length; index += 1) {
        const entry = manifestEntries[index];
        if (typeof entry !== "string") {
            const observedType = entry === null ? "null" : Array.isArray(entry) ? "array" : typeof entry;
            errors.push(createLoadError(manifestEntry.source, "schema_mismatch", `Schema mismatch in manifest ${manifestEntry.source}: expected files[${index}] to be a string, got ${observedType}`));
            continue;
        }
        const normalizedEntry = basename(entry);
        const matchedFile = uploadMap.get(normalizedEntry);
        if (!matchedFile) {
            errors.push(createLoadError(manifestEntry.source, "schema_mismatch", `Manifest references '${entry}' but no uploaded file matched`));
            continue;
        }
        try {
            const normalizedRoles = normalizeExtractedRoles(matchedFile.json, matchedFile.source);
            roles.push(...normalizedRoles);
        }
        catch (err) {
            const errType = err instanceof Error && "type" in err ? err.type : "parse_error";
            const errMsg = err instanceof Error ? err.message : "Failed to load role file";
            console.warn(`Failed to load ${matchedFile.source}`, err);
            errors.push(createLoadError(matchedFile.source, errType, errMsg));
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
        const area = role.Area || "Unassigned";
        if (!map[area])
            map[area] = [];
        map[area].push(role);
    }
    return map;
}
//# sourceMappingURL=dataLoader.js.map