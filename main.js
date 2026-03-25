import { loadAllRoles, groupByArea } from "./dataLoader.js";
import { renderSidebar } from "./uiSidebar.js";
import { renderRole } from "./uiRoleView.js";

let ALL_ROLES = [];

function renderSidebarErrors(sidebarError, errors) {
  if (errors.length === 0) {
    sidebarError.className = "";
    sidebarError.textContent = "";
    return;
  }

  sidebarError.className = "error";
  const sourceCount = errors.length;
  sidebarError.textContent = `${sourceCount} source${sourceCount === 1 ? "" : "s"} failed`;

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "Show details";
  details.appendChild(summary);

  const list = document.createElement("ul");
  for (const { source, type, message } of errors) {
    const item = document.createElement("li");
    item.textContent = `${source}${type ? ` (${type})` : ""}${message ? `: ${message}` : ""}`;
    list.appendChild(item);
  }

  details.appendChild(list);
  sidebarError.appendChild(details);
}

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
  } else {
    renderSidebarErrors(sidebarError, errors);
  }

  const groups = groupByArea(roles);

  renderSidebar(
    groups,
    (role) => renderRole(role, mainContainer),
    sidebarContainer
  );
})();
