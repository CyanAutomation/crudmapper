export function parsePermission(raw) {
  if (!raw || typeof raw !== "string") {
    return { name: "", canonicalName: "", crud: "" };
  }

  try {
    const normalizeCrud = (value) => {
      if (!value) return "";

      const withCanonicalWords = value
        .replace(/\b(create)\b/gi, "C")
        .replace(/\b(read)\b/gi, "R")
        .replace(/\b(update)\b/gi, "U")
        .replace(/\b(delete)\b/gi, "D");

      const crudTokenPattern =
        /(?:^|[^A-Z0-9])([CRUD](?:[\s,;:|\/-]*[CRUD])*)(?=$|[^A-Z0-9])/gi;
      const discovered = new Set();
      let match;

      while ((match = crudTokenPattern.exec(withCanonicalWords.toUpperCase()))) {
        if (match.index === crudTokenPattern.lastIndex) {
          crudTokenPattern.lastIndex++;
        }
        match[1]
          .replace(/[^CRUD]/g, "")
          .split("")
          .forEach((token) => discovered.add(token));
      }

      return "CRUD"
        .split("")
        .filter((token) => discovered.has(token))
        .join("");
    };

    const stripTrailingCrudTokens = (value) => {
      const trailingCrudWordsPattern =
        /([\s\-:|/,()\\]+(?:(?:create|read|update|delete)(?:[\s,;:|/\-\\]+|$)){1,4}\s*[\)\]]?)$/i;
      const trailingCrudLettersPattern =
        /([\s\-:|/,()\\]+(?:[CRUD](?:[\s,;:|/\-\\]*[CRUD])*)\s*[\)\]]?)$/i;

      const withoutWords = value.replace(trailingCrudWordsPattern, "");
      const withoutLetters = withoutWords.replace(trailingCrudLettersPattern, "");
      const normalized = withoutLetters.trim().replace(/\s+/g, " ");

      return normalized || value.trim().replace(/\s+/g, " ");
    };

    const cleaned = raw.replace(/\r/g, "").trim();
    const lines = cleaned.split("\n");
    const nonEmptyLineIndex = lines.findIndex((line) => line.trim());
    const nonEmptyLine =
      nonEmptyLineIndex >= 0 ? lines[nonEmptyLineIndex] : undefined;

    const rawName = (nonEmptyLine ?? lines[0] ?? "").trim();
    const name = stripTrailingCrudTokens(rawName);
    const canonicalName = name.toLowerCase();

    if (!name) {
      return { name: "", canonicalName: "", crud: "" };
    }

    // Accepted CRUD token formats include:
    // - Standalone markers on a separate line: "Permission Name\nC R"
    // - Inline compact markers: "Permission Name - CR"
    // - Inline delimited markers: "Permission Name (C,R)"
    // - Inline verb words: "Permission Name - Create Read"
    // - Missing CRUD markers results in an empty string.
    const crud = normalizeCrud(cleaned);

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
