export function parsePermission(raw) {
  if (!raw || typeof raw !== "string") {
    return { name: "", crud: "" };
  }

  try {
    const cleaned = raw.replace(/\r/g, "").trim();
    const lines = cleaned.split("\n");
    const nonEmptyLine = lines.find((line) => line.trim());

    const name = (nonEmptyLine ?? lines[0] ?? "").trim();
    if (!name) {
      return { name: "", crud: "" };
    }

    const crudLine = lines.find((line) => /[CRUDcrud]/.test(line));
    const crudSource =
      crudLine ??
      lines
        .filter((line) => line.trim() !== name)
        .join("");
    const crud = crudSource.toUpperCase().replace(/[^CRUD]/g, "");

    return { name, crud };
  } catch {
    return { name: "", crud: "" };
  }
}

export function normalizeRole(role) {
  const permissionMap = {};

  (role.Permissions ?? []).forEach((raw) => {
    const { name, crud } = parsePermission(raw);
    if (!name) return;

    if (!permissionMap[name]) {
      permissionMap[name] = new Set();
    }

    crud.split("").forEach((letter) => permissionMap[name].add(letter));
  });

  return {
    ...role,
    NormalizedPermissions: permissionMap,
    _cachedCategories: null
  };
}
