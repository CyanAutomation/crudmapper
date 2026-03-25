export const CATEGORY_MAP = {
  Flights: ["Flight", "Schedule", "Trip"],
  Operations: ["Ops", "Operation"],
  Maintenance: ["Maintenance", "Mx", "WorkOrder", "Parts"],
  Finance: ["Invoice", "Billing", "Payment"],
  CRM: ["Customer", "Client", "Account"],
  System: ["System", "Admin", "Config"]
};

function normalizePermissionNameForMatch(name) {
  return String(name ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function getCategoryForPermission(name) {
  const normalizedName = normalizePermissionNameForMatch(name);

  for (const [category, prefixes] of Object.entries(CATEGORY_MAP)) {
    if (
      prefixes.some((prefix) => {
        const normalizedPrefix = prefix.toLowerCase();
        return normalizedName.startsWith(normalizedPrefix);
      })
    ) {
      return category;
    }
  }
  return "Other";
}
