import { getCategoryForPermission } from "./categoryMap.js";

function safeText(str: unknown): string {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.textContent || "";
}

interface PermissionItem {
  key: string;
  name: string;
  crudSet: Set<string>;
}

export function renderRole(role: Record<string, unknown>, container: HTMLElement): void {
  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "role-header";

  header.innerHTML = `
    <h2>${safeText((role.FriendlyName as string | undefined) ?? (role.Name as string | undefined))}</h2>
    <div class="role-metadata">
      <div class="role-meta-line"><span class="role-meta-label">Role ID</span><span class="role-meta-value"><code class="font-mono machine-string">${safeText(role.Name ?? "N/A")}</code></span></div>
      <div class="role-meta-line"><span class="role-meta-label">Area</span><span class="role-meta-value font-mono">${safeText(role.Area ?? "N/A")}</span></div>
      <div class="role-meta-line"><span class="role-meta-label">Rank</span><span class="role-meta-value font-mono">${safeText(role.Rank ?? "N/A")}</span></div>
    </div>

    <input id="permSearch" type="text" placeholder="Search permissions…" />
    <div class="legend"><span class="role-meta-label">CRUD legend</span> <span class="legend-values font-mono">C R U D</span></div>
  `;

  container.appendChild(header);

  const searchBox = header.querySelector("#permSearch") as HTMLInputElement;
  searchBox.addEventListener("input", () => {
    renderPermissionList(role, container, searchBox.value);
  });

  renderPermissionList(role, container, "");
}

export function renderPermissionList(
  role: Record<string, unknown>,
  container: HTMLElement,
  filter: string
): void {
  Array.from(container.querySelectorAll(".permission-category")).forEach((x) => x.remove());

  const lowerFilter = filter.toLowerCase();
  const categories: Record<string, PermissionItem[]> = {};

  const normalizedPermissions = (role.NormalizedPermissions as Record<string, Set<string>>) || {};
  const permissionLabels = (role.PermissionLabels as Record<string, string>) || {};

  Object.keys(normalizedPermissions).forEach((permission) => {
    const displayName = permissionLabels[permission] ?? permission;
    const category = getCategoryForPermission(permission);
    if (!categories[category]) categories[category] = [];

    categories[category].push({
      key: permission,
      name: displayName,
      crudSet: normalizedPermissions[permission],
    });
  });

  Object.keys(categories)
    .sort()
    .forEach((category) => {
      const catDiv = document.createElement("div");
      catDiv.className = "permission-category";

      const title = document.createElement("div");
      title.className = "category-title";

      const label = document.createElement("span");
      label.textContent = category;

      const icon = document.createElement("span");
      icon.textContent = "▼";

      title.appendChild(label);
      title.appendChild(icon);

      const content = document.createElement("div");

      title.onclick = () => {
        const isOpen = content.style.display !== "none";
        content.style.display = isOpen ? "none" : "block";
        icon.textContent = isOpen ? "▶" : "▼";
      };

      categories[category]
        .filter((item) => item.name.toLowerCase().includes(lowerFilter))
        .forEach((item) => {
          const row = document.createElement("div");
          row.className = "permission-row";

          const nameCol = document.createElement("div");
          nameCol.className = "permission-name";
          nameCol.innerHTML = `
            <div class="permission-label">${safeText(item.name)}</div>
            <div class="permission-key"><code class="font-mono machine-string">${safeText(item.key)}</code></div>
          `;

          row.appendChild(nameCol);

          ["C", "R", "U", "D"].forEach((letter) => {
            const cell = document.createElement("span");
            cell.className = `crud-cell crud-cell--${letter.toLowerCase()}`;
            if (item.crudSet.has(letter)) {
              cell.classList.add("enabled");
            }
            cell.textContent = letter;
            row.appendChild(cell);
          });

          content.appendChild(row);
        });

      catDiv.appendChild(title);
      catDiv.appendChild(content);
      container.appendChild(catDiv);
    });
}
