import { loadAllRoles, groupByArea } from "./dataLoader.js";
import { renderSidebar } from "./uiSidebar.js";
import { renderRole } from "./uiRoleView.js";

let ALL_ROLES = [];

(async function init() {
  const sidebarContainer = document.getElementById("sidebarContent");
  const mainContainer = document.getElementById("main");

  if (!sidebarContainer || !mainContainer) {
    console.error("Required DOM elements not found");
    return;
  }

  const sidebarError = document.createElement("div");
  sidebarError.id = "sidebarError";
  sidebarContainer.before(sidebarError);

  const { roles, errors } = await loadAllRoles();
  ALL_ROLES = roles;

  if (errors.length > 0) {
    sidebarError.className = "error";
    sidebarError.textContent = `Some files failed to load: ${errors.join(", ")}`;
  } else {
    sidebarError.textContent = "";
    sidebarError.className = "";
  }

  const groups = groupByArea(roles);

  renderSidebar(
    groups,
    (role) => renderRole(role, mainContainer),
    sidebarContainer
  );
})();
