import { loadAllRoles, groupByArea } from "./dataLoader.js";
import { renderSidebar } from "./uiSidebar.js";
import { renderRole } from "./uiRoleView.js";

let ALL_ROLES = [];

(async function init() {
  const sidebarContainer = document.getElementById("sidebarContent");
  const mainContainer = document.getElementById("main");

  const { roles, errors } = await loadAllRoles();
  ALL_ROLES = roles;

  if (errors.length > 0) {
    sidebarContainer.innerHTML = `
      <div class="error">Failed to load: ${errors.join(", ")}</div>
    `;
  }

  const groups = groupByArea(roles);

  renderSidebar(
    groups,
    (role) => renderRole(role, mainContainer),
    sidebarContainer
  );
})();