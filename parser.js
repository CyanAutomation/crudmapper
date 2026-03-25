export function parsePermission(raw) {
  if (!raw || typeof raw !== "string") {
    return { name: "", canonicalName: "", crud: "" };
  }

  try {
    const cleaned = raw.replace(/\r/g, "").trim();
    const lines = cleaned.split("\n");
    const nonEmptyLine = lines.find((line) => line.trim());

    const rawName = (nonEmptyLine ?? lines[0] ?? "").trim();
    const name = rawName.replace(/\s+/g, " ");
    const canonicalName = name.toLowerCase();

    if (!name) {
      return { name: "", canonicalName: "", crud: "" };
    }

    const crudLine = lines.find((line) => /[CRUDcrud]/.test(line));
    const crudSource =
      crudLine ??
      lines
        .filter((line) => line.trim() !== name)
        .join("");
    const crud = crudSource.toUpperCase().replace(/[^CRUD]/g, "");

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
