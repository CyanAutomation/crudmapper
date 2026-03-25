export function parsePermission(raw) {
  if (!raw || typeof raw !== "string") {
    return { name: "", crud: "" };
  }

  const cleaned = raw.replace(/\r/g, "").trim();
  const lines = cleaned.split("\n");

  const name = (lines ?? "").trim();
  const crud =
    (lines ?? "")
      .trim()
      .toUpperCase()
      .replace(/[^CRUD]/g, "");

  return { name, crud };
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