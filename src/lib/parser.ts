import type { Permission, NormalizedRole } from "./types.js";

export function parsePermission(raw: unknown): Permission {
  if (!raw || typeof raw !== "string") {
    return { name: "", canonicalName: "", crud: "" };
  }

  try {
    const normalizeCrud = (value: string): string => {
      if (!value) return "";

      const withCanonicalWords = value
        .replace(/\b(create)\b/gi, "C")
        .replace(/\b(read)\b/gi, "R")
        .replace(/\b(update)\b/gi, "U")
        .replace(/\b(delete)\b/gi, "D");

      const crudTokenPattern = /(?:^|[^A-Z0-9])([CRUD](?:[\s,;:|/-]*[CRUD])*)(?=$|[^A-Z0-9])/gi;
      const discovered = new Set<string>();
      let match: RegExpExecArray | null;

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

    const stripTrailingCrudTokens = (value: string): string => {
      const trailingCrudWordsPattern =
        /([\s\-:|/,()\\]+(?:(?:create|read|update|delete)(?:[\s,;:|/\-\\]+|$)){1,4}\s*[)\]]?)$/i;
      const trailingCrudLettersPattern =
        /([\s\-:|/,()\\]+(?:[CRUD](?:[\s,;:|/\-\\]*[CRUD])*)\s*[)\]]?)$/i;

      const withoutWords = value.replace(trailingCrudWordsPattern, "");
      const withoutLetters = withoutWords.replace(trailingCrudLettersPattern, "");
      const normalized = withoutLetters.trim().replace(/\s+/g, " ");

      return normalized || value.trim().replace(/\s+/g, " ");
    };

    const cleaned = raw.replace(/\r/g, "").trim();
    const lines = cleaned.split("\n");
    const nonEmptyLineIndex = lines.findIndex((line) => line.trim());
    const nonEmptyLine = nonEmptyLineIndex >= 0 ? lines[nonEmptyLineIndex] : undefined;

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

export function normalizeRole(role: unknown): NormalizedRole {
  const roleObj = role as Record<string, unknown>;

  const normalizedPermissions = Array.isArray(roleObj?.Permissions) ? roleObj.Permissions : [];
  const normalizedActions = Array.isArray(roleObj?.Actions) ? roleObj.Actions : [];
  const normalizedNavigation = Array.isArray(roleObj?.Navigation) ? roleObj.Navigation : [];

  const normalizedArea =
    typeof roleObj?.Area === "string" && (roleObj.Area as string).trim().length > 0
      ? roleObj.Area
      : "Unassigned";
  const normalizedRank = Number.isFinite(roleObj?.Rank as number) ? roleObj.Rank : 0;
  const normalizedFriendlyName =
    typeof roleObj?.FriendlyName === "string" && (roleObj.FriendlyName as string).trim().length > 0
      ? roleObj.FriendlyName
      : roleObj?.Name || "Unnamed Role";

  const permissionMap: Record<string, Set<string>> = {};
  const permissionLabels: Record<string, string> = {};

  (normalizedPermissions as unknown[]).forEach((raw) => {
    const { name, canonicalName, crud } = parsePermission(raw);
    if (!canonicalName) return;

    if (!permissionMap[canonicalName]) {
      permissionMap[canonicalName] = new Set();
      permissionLabels[canonicalName] = name;
    }

    crud.split("").forEach((letter) => permissionMap[canonicalName]!.add(letter));
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
    _cachedCategories: null,
  } as NormalizedRole;
}
