export function renderSidebar(groups, onRoleClick, container) {
  container.innerHTML = "";

  Object.keys(groups)
    .sort()
    .forEach((area) => {
      const areaDiv = document.createElement("div");

      const title = document.createElement("div");
      title.className = "area-title";

      const storageKey = "area-" + area;
      let isExpanded = false;
      try {
        isExpanded = JSON.parse(localStorage.getItem(storageKey) ?? "false");
      } catch {
        isExpanded = false;
        localStorage.removeItem(storageKey);
      }

      const label = document.createElement("span");
      label.textContent = area;

      const icon = document.createElement("span");
      icon.className = "area-icon";
      icon.textContent = isExpanded ? "▼" : "▶";

      title.appendChild(label);
      title.appendChild(icon);

      const list = document.createElement("div");
      list.style.display = isExpanded ? "block" : "none";

      title.onclick = () => {
        const newState = list.style.display === "none";
        list.style.display = newState ? "block" : "none";
        icon.textContent = newState ? "▼" : "▶";
        localStorage.setItem(storageKey, JSON.stringify(newState));
      };

      groups[area].forEach((role) => {
        const r = document.createElement("div");
        r.className = "role-name";
        r.textContent = role.Name;
        r.onclick = () => onRoleClick(role);
        list.appendChild(r);
      });

      areaDiv.appendChild(title);
      areaDiv.appendChild(list);
      container.appendChild(areaDiv);
    });
}
