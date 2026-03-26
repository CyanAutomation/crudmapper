import { loadAllRoles, loadRolesFromFiles, groupByArea } from "./dataLoader.js";
import { renderSidebar } from "./uiSidebar.js";
import { renderRole } from "./uiRoleView.js";
import type { LoadError } from "./types.js";

function renderSidebarErrors(sidebarError: HTMLElement, errors: LoadError[]): void {
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

interface RoleSourceConfig {
  roleFiles?: string[];
  manifestPath?: string;
}

(async function init() {
  const sidebarContainer = document.getElementById("sidebarContent");
  const mainContainer = document.getElementById("main");
  const uploadSection = document.getElementById("runtimeSourceControls");
  const fileInput = document.getElementById("roleFileInput") as HTMLInputElement | null;
  const dropZone = document.getElementById("roleDropZone");
  const roleSourceConfig = (globalThis as any).ROLE_SOURCE_CONFIG as RoleSourceConfig | undefined;

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
  let localFiles: File[] = [];

  async function loadAndRenderRoles(): Promise<void> {
    const hasLocalFiles = localFiles.length > 0;
    if (!hasLocalFiles && !hasRoleConfig) {
      sidebarError.className = "";
      sidebarError.textContent = "";
      sidebarContainer!.textContent = "Load one or more role JSON files to begin.";
      mainContainer!.textContent = "";
      // Show upload section, hide main
      uploadSection?.classList.remove("hidden");
      mainContainer?.classList.add("hidden");
      return;
    }

    let loaded;
    if (hasLocalFiles) {
      loaded = await loadRolesFromFiles(localFiles);
    } else if (hasRoleConfig) {
      loaded = await loadAllRoles(config);
    } else {
      loaded = await loadAllRoles(config);
    }

    const { roles, errors } = loaded;

    renderSidebarErrors(sidebarError, errors);

    const groups = groupByArea(roles);

    renderSidebar(
      groups,
      (role) => renderRole(role as unknown as Record<string, unknown>, mainContainer!),
      sidebarContainer!
    );

    // Hide upload section, show main
    uploadSection?.classList.add("hidden");
    mainContainer?.classList.remove("hidden");
  }

  function updateLocalFiles(fileList: FileList | null | undefined): void {
    localFiles = Array.from(fileList || []).sort((a, b) => a.name.localeCompare(b.name));
    void loadAndRenderRoles();
  }

  fileInput.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    updateLocalFiles(target.files);
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
    const dragEvent = event as DragEvent;
    updateLocalFiles(dragEvent.dataTransfer?.files);
  });

  await loadAndRenderRoles();
})();
