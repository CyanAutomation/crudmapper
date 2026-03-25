import { getCategoryForPermission } from "./categoryMap.js";

function safeText(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.textContent;
}

export function renderRole(role, container) {
  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "role-header";

  header.innerHTML = `
    <h2>${safeText(role.FriendlyName ?? role.Name)}</h2>
    <div class="role-metadata">
      <div class="role-meta-line"><span class="role-meta-label">Role ID</span><span class="role-meta-value font-mono">${safeText(role.Name ?? "N/A")}</span></div>
      <div class="role-meta-line"><span class="role-meta-label">Area</span><span class="role-meta-value font-mono">${safeText(role.Area ?? "N/A")}</span></div>
      <div class="role-meta-line"><span class="role-meta-label">Rank</span><span class="role-meta-value font-mono">${safeText(role.Rank ?? "N/A")}</span></div>
    </div>

    <input id="permSearch" type="text" placeholder="Search permissions…" />
    <div class="legend"><span class="role-meta-label">CRUD legend</span> <span class="legend-values font-mono">C R U D</span></div>
  `;

  container.appendChild(header);

  const searchBox = header.querySelector("#permSearch");
  searchBox.addEventListener("input", () => {
    renderPermissionList(role, container, searchBox.value);
  });

  renderPermissionList(role, container, "");
}

export function renderPermissionList(role, container, filter) {
  [...container.querySelectorAll(".permission-category")].forEach((x) =>
    x.remove()
  );

  const lowerFilter = filter.toLowerCase();
  const categories = {};

  Object.keys(role.NormalizedPermissions).forEach((permission) => {
    const displayName = role.PermissionLabels?.[permission] ?? permission;
    const category = getCategoryForPermission(permission);
    if (!categories[category]) categories[category] = [];

    categories[category].push({
      key: permission,
      name: displayName,
      crudSet: role.NormalizedPermissions[permission]
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
        .filter((item) =>
          item.name.toLowerCase().includes(lowerFilter)
        )
        .forEach((item) => {
          const row = document.createElement("div");
          row.className = "permission-row";

          const nameCol = document.createElement("div");
          nameCol.className = "permission-name";
          nameCol.innerHTML = `
            <div class="permission-label">${safeText(item.name)}</div>
            <div class="permission-key font-mono">${safeText(item.key)}</div>
          `;

          const crudCol = document.createElement("div");
          crudCol.className = "crud-cells";

          ["C", "R", "U", "D"].forEach((letter) => {
            const cell = document.createElement("span");
            cell.className = `crud-cell crud-cell--${letter.toLowerCase()}`;
            if (item.crudSet.has(letter)) {
              cell.classList.add("enabled");
            }
            cell.textContent = letter;
            crudCol.appendChild(cell);
          });

          row.appendChild(nameCol);
          row.appendChild(crudCol);
          content.appendChild(row);
        });

      catDiv.appendChild(title);
      catDiv.appendChild(content);
      container.appendChild(catDiv);
    });
}
