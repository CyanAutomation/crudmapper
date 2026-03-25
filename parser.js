export function parsePermission(raw) {
  if (!raw || typeof raw !== "string") {
    return { name: "", canonicalName: "", crud: "" };
  }

  try {
    const cleaned = raw.replace(/\r/g, "").trim();
    const lines = cleaned.split("\n");
    const nonEmptyLineIndex = lines.findIndex((line) => line.trim());
    const nonEmptyLine =
      nonEmptyLineIndex >= 0 ? lines[nonEmptyLineIndex] : undefined;

    const rawName = (nonEmptyLine ?? lines[0] ?? "").trim();
    const name = rawName.replace(/\s+/g, " ");
    const canonicalName = name.toLowerCase();

    if (!name) {
      return { name: "", canonicalName: "", crud: "" };
    }

    // Accepted explicit CRUD token formats include:
    // - Space separated markers: "C R U D"
    // - Compact markers: "CRU"
    // - Delimited markers: "C,R,U" (also supports ; : | / - delimiters)
    const explicitCrudLinePattern =
      /^\s*[CRUD](?:[\s,;:|\/-]*[CRUD])*\s*$/i;

    const crudLine = lines.find(
      (line, index) =>
        index !== nonEmptyLineIndex && explicitCrudLinePattern.test(line)
    );
    const crud = crudLine
      ? crudLine.toUpperCase().replace(/[^CRUD]/g, "")
      : "";

    return { name, canonicalName, crud };
  } catch {
    return { name: "", canonicalName: "", crud: "" };
  }
}

export function normalizeRole(role) {
  const permissionMap = {};
  const permissionLabels = {};

  (role.Permissions ?? []).forEach((raw) => {
    const { name, canonicalName, crud } = parsePermission(raw);
    if (!canonicalName) return;

    if (!permissionMap[canonicalName]) {
      permissionMap[canonicalName] = new Set();
      permissionLabels[canonicalName] = name;
    }

    crud
      .split("")
      .forEach((letter) => permissionMap[canonicalName].add(letter));
  });

  return {
    ...role,
    NormalizedPermissions: permissionMap,
    PermissionLabels: permissionLabels,
    _cachedCategories: null
  };
}
