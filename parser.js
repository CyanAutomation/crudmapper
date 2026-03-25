export function parsePermission(raw) {
  if (!raw || typeof raw !== "string") {
    return { name: "", canonicalName: "", crud: "" };
  }

  try {
    const normalizeCrud = (value) => {
      if (!value) return "";

      const withCanonicalWords = value
        .replace(/\bcreate\b/gi, "C")
        .replace(/\bread\b/gi, "R")
        .replace(/\bupdate\b/gi, "U")
        .replace(/\bdelete\b/gi, "D");

      const crudTokenPattern =
        /(?:^|[^A-Z0-9])([CRUD](?:[\s,;:|\/-]*[CRUD])*)(?=$|[^A-Z0-9])/gi;
      const discovered = new Set();
      let match;

      while ((match = crudTokenPattern.exec(withCanonicalWords.toUpperCase()))) {
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
        /([\s\-:|/,(]+(?:(?:create|read|update|delete)(?:[\s,;:|/-]+|$)){1,4})$/i;
      const trailingCrudLettersPattern =
        /([\s\-:|/,(]+(?:[CRUD](?:[\s,;:|/-]*[CRUD])*)\s*)$/i;

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
    const crud = crudLine ? normalizeCrud(crudLine) : normalizeCrud(cleaned);

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
