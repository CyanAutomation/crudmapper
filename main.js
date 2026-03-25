import { loadAllRoles, loadRolesFromFiles, groupByArea } from "./dataLoader.js";
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
  const fileInput = document.getElementById("roleFileInput");
  const dropZone = document.getElementById("roleDropZone");
  const roleSourceConfig = window.ROLE_SOURCE_CONFIG;

  if (!sidebarContainer || !mainContainer || !fileInput || !dropZone) {
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
  let localFiles = [];

  async function loadAndRenderRoles() {
    const hasLocalFiles = localFiles.length > 0;
    if (!hasLocalFiles && !hasRoleConfig) {
      ALL_ROLES = [];
      sidebarError.className = "";
      sidebarError.textContent = "";
      sidebarContainer.textContent = "Load one or more role JSON files to begin.";
      mainContainer.textContent = "";
      return;
    }

    let loaded;
    if (hasLocalFiles) {
      loaded = await loadRolesFromFiles(localFiles);
    } else if (hasRoleConfig) {
      loaded = await loadAllRoles(config);
    } else {
      loaded = { roles: [], errors: [] };
    }

    const { roles, errors } = loaded;

    ALL_ROLES = roles;
    renderSidebarErrors(sidebarError, errors);

    const groups = groupByArea(roles);

    renderSidebar(
      groups,
      (role) => renderRole(role, mainContainer),
      sidebarContainer
    );
  }

  function updateLocalFiles(fileList) {
    localFiles = Array.from(fileList || []).sort((a, b) => a.name.localeCompare(b.name));
    void loadAndRenderRoles();
  }

  fileInput.addEventListener("change", (event) => {
    updateLocalFiles(event.target.files);
  });

  dropZone.addEventListener("dragenter", (event) => {
    event.preventDefault();
    dropZone.classList.add("is-drag-over");
  });

  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("is-drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("is-drag-over");
  });

  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-drag-over");
    updateLocalFiles(event.dataTransfer?.files);
  });

  await loadAndRenderRoles();
})();
