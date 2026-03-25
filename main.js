import { loadAllRoles, groupByArea } from "./dataLoader.js";
import { renderSidebar } from "./uiSidebar.js";
import { renderRole } from "./uiRoleView.js";

let ALL_ROLES = [];

(async function init() {
  const sidebarContainer = document.getElementById("sidebarContent");
  const mainContainer = document.getElementById("main");
  const roleSourceConfig = window.ROLE_SOURCE_CONFIG;

  if (!sidebarContainer || !mainContainer) {
    console.error("Required DOM elements not found");
    return;
  }

  const sidebarError = document.createElement("div");
  sidebarError.id = "sidebarError";
  sidebarContainer.before(sidebarError);

  const hasRoleConfig =
    roleSourceConfig &&
    typeof roleSourceConfig === "object" &&
    (Array.isArray(roleSourceConfig.roleFiles) ||
      typeof roleSourceConfig.manifestPath === "string");

  const config = hasRoleConfig ? roleSourceConfig : { roleFiles: [] };
  const { roles, errors } = await loadAllRoles(config);
  ALL_ROLES = roles;

  if (!hasRoleConfig) {
    sidebarError.className = "error";
    sidebarError.textContent =
      "No role source configuration found. Add window.ROLE_SOURCE_CONFIG with roleFiles or manifestPath.";
  } else if (errors.length > 0) {
    sidebarError.className = "error";
    sidebarError.textContent = `Some files failed to load: ${errors.join(", ")}`;
  } else {
    sidebarError.className = "";
    sidebarError.textContent = "";
  }

  const groups = groupByArea(roles);

  renderSidebar(
    groups,
    (role) => renderRole(role, mainContainer),
    sidebarContainer
  );
})();
