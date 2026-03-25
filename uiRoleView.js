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
    <div><strong>Area:</strong> ${safeText(role.Area)}</div>
    <div><strong>Rank:</strong> ${safeText(role.Rank ?? "N/A")}</div>

    <input id="permSearch" type="text" placeholder="Search permissions…" />
    <div class="legend"><strong>CRUD Legend:</strong> C R U D</div>
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
    const category = getCategoryForPermission(permission);
    if (!categories[category]) categories[category] = [];

    categories[category].push({
      name: permission,
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
          nameCol.textContent = item.name;

          const crudCol = document.createElement("div");
          crudCol.className = "crud-cells";

          ["C", "R", "U", "D"].forEach((letter) => {
            const cell = document.createElement("span");
            cell.className = "crud-cell";
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