export const CATEGORY_MAP = {
  Flights: ["Flight", "Schedule", "Trip"],
  Operations: ["Ops", "Operation"],
  Maintenance: ["Maintenance", "Mx", "WorkOrder", "Parts"],
  Finance: ["Invoice", "Billing", "Payment"],
  CRM: ["Customer", "Client", "Account"],
  System: ["System", "Admin", "Config"]
};

export function getCategoryForPermission(name) {
  for (const [category, prefixes] of Object.entries(CATEGORY_MAP)) {
    if (prefixes.some((prefix) => name.startsWith(prefix))) {
      return category;
    }
  }
  return "Other";
}