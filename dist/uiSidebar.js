let hasLoggedSidebarPersistenceWarning = false;
let selectedRoleElement = null;
let selectedRoleName = null;
export function renderSidebar(groups, onRoleClick, container) {
    container.innerHTML = "";
    if (selectedRoleElement && !container.contains(selectedRoleElement)) {
        selectedRoleElement = null;
    }
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
        }
        catch {
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
            try {
                localStorage.setItem(storageKey, JSON.stringify(newState));
            }
            catch {
                if (!hasLoggedSidebarPersistenceWarning) {
                    console.debug("Sidebar state persistence unavailable; continuing without localStorage updates.");
                    hasLoggedSidebarPersistenceWarning = true;
                }
            }
        };
        groups[area].forEach((role) => {
            const r = document.createElement("div");
            r.className = "role-name";
            r.textContent = role.Name;
            if (role.Name === selectedRoleName) {
                selectedRoleElement = r;
                selectedRoleElement.classList.add("is-selected");
                selectedRoleElement.setAttribute("aria-current", "true");
            }
            r.onclick = () => {
                if (selectedRoleElement) {
                    selectedRoleElement.classList.remove("is-selected");
                    selectedRoleElement.removeAttribute("aria-current");
                }
                selectedRoleElement = r;
                selectedRoleName = role.Name;
                selectedRoleElement.classList.add("is-selected");
                selectedRoleElement.setAttribute("aria-current", "true");
                onRoleClick(role);
            };
            list.appendChild(r);
        });
        areaDiv.appendChild(title);
        areaDiv.appendChild(list);
        container.appendChild(areaDiv);
    });
}
//# sourceMappingURL=uiSidebar.js.map