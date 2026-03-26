import type { CategoryMap, CategoryAliases } from "./types.js";

export const CATEGORY_MAP: CategoryMap = {
  Flights: ["Flight", "Schedule", "Trip"],
  Operations: ["Ops", "Operation"],
  Maintenance: ["Maintenance", "Mx", "WorkOrder", "Parts"],
  Finance: ["Invoice", "Billing", "Payment"],
  CRM: ["Customer", "Client", "Account"],
  System: ["System", "Admin", "Config"],
};

export const CATEGORY_ALIASES: CategoryAliases = {
  CRM: ["account", "client", "customer"],
  Finance: ["invoice", "billing", "payment"],
};

function normalizePermissionNameForPrefix(name: unknown): string {
  return String(name ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function tokenizePermissionName(name: unknown): string[] {
  const value = String(name ?? "").trim();

  return value
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .split(/[\s_./\\-]+/)
    .filter(Boolean);
}

function hasTokenMatch(tokens: string[], matchTerms: string[]): boolean {
  const tokenSet = new Set(tokens);
  const normalizedTerms = matchTerms.map((term) => String(term).toLowerCase());
  return normalizedTerms.some((term) => tokenSet.has(term));
}

export function getCategoryForPermission(name: unknown): string {
  const normalizedName = normalizePermissionNameForPrefix(name);
  const tokens = tokenizePermissionName(name);

  for (const [category, prefixes] of Object.entries(CATEGORY_MAP)) {
    const hasPrefixMatch = prefixes.some((prefix) => {
      const normalizedPrefix = prefix.toLowerCase();
      return normalizedName.startsWith(normalizedPrefix);
    });

    if (hasPrefixMatch) {
      return category;
    }

    const aliases = CATEGORY_ALIASES[category] ?? [];
    const termsForTokenMatch = [...prefixes, ...aliases];

    if (hasTokenMatch(tokens, termsForTokenMatch)) {
      return category;
    }
  }

  return "Other";
}
