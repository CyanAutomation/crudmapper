import { a2 as store_get, a3 as ensure_array_like, e as escape_html, a4 as attr_class, a5 as unsubscribe_stores, a6 as attr, a7 as stringify, a8 as head, a9 as bind_props } from "../../chunks/index2.js";
import { w as writable } from "../../chunks/index.js";
import { g as groupByArea } from "../../chunks/dataLoader.js";
const roles = writable([]);
const errors = writable([]);
const expandedAreas = writable(/* @__PURE__ */ new Set());
const selectedRoleName = writable(null);
function Sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let rolesByArea = {};
    rolesByArea = groupByArea(store_get($$store_subs ??= {}, "$roles", roles));
    $$renderer2.push(`<div id="sidebar" class="svelte-129hoe0">`);
    if (store_get($$store_subs ??= {}, "$roles", roles).length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p style="color: var(--color-on-surface-variant); font-size: 0.9rem;">No roles loaded. Upload role files to get started.</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(Object.keys(rolesByArea).sort());
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let area = each_array[$$index_1];
        $$renderer2.push(`<div class="area-title svelte-129hoe0" role="button" tabindex="0"><span>${escape_html(area)}</span> <span class="area-icon svelte-129hoe0">${escape_html(store_get($$store_subs ??= {}, "$expandedAreas", expandedAreas).has(area) ? "▼" : "▶")}</span></div> `);
        if (store_get($$store_subs ??= {}, "$expandedAreas", expandedAreas).has(area)) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div><!--[-->`);
          const each_array_1 = ensure_array_like(rolesByArea[area]);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let role = each_array_1[$$index];
            $$renderer2.push(`<div${attr_class("role-name svelte-129hoe0", void 0, {
              "is-selected": store_get($$store_subs ??= {}, "$selectedRoleName", selectedRoleName) === role.Name
            })} role="button" tabindex="0">${escape_html(role.Name)}</div>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
const searchQuery = writable("");
const CATEGORY_MAP = {
  Flights: ["Flight", "Schedule", "Trip"],
  Operations: ["Ops", "Operation"],
  Maintenance: ["Maintenance", "Mx", "WorkOrder", "Parts"],
  Finance: ["Invoice", "Billing", "Payment"],
  CRM: ["Customer", "Client", "Account"],
  System: ["System", "Admin", "Config"]
};
const CATEGORY_ALIASES = {
  CRM: ["account", "client", "customer"],
  Finance: ["invoice", "billing", "payment"]
};
function normalizePermissionNameForPrefix(name) {
  return String(name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}
function tokenizePermissionName(name) {
  const value = String(name ?? "").trim();
  return value.replace(/([a-z\d])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").toLowerCase().split(/[\s_./\\-]+/).filter(Boolean);
}
function hasTokenMatch(tokens, matchTerms) {
  const tokenSet = new Set(tokens);
  const normalizedTerms = matchTerms.map((term) => String(term).toLowerCase());
  return normalizedTerms.some((term) => tokenSet.has(term));
}
function getCategoryForPermission(name) {
  const normalizedName = normalizePermissionNameForPrefix(name);
  const tokens = tokenizePermissionName(name);
  for (const [category, prefixes] of Object.entries(CATEGORY_MAP)) {
    const hasPrefixMatch = prefixes.some((prefix) => {
      const normalizedPrefix = prefix.toLowerCase();
      return normalizedName.startsWith(normalizedPrefix);
    });
    if (hasPrefixMatch) {
      return category;
    }
    const aliases = CATEGORY_ALIASES[category] ?? [];
    const termsForTokenMatch = [...prefixes, ...aliases];
    if (hasTokenMatch(tokens, termsForTokenMatch)) {
      return category;
    }
  }
  return "Other";
}
function RoleDetail($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let selectedRole = null;
    let permissionsByCategory = {};
    function updatePermissions() {
      const normalized = selectedRole;
      const lowerFilter = store_get($$store_subs ??= {}, "$searchQuery", searchQuery).toLowerCase();
      const categories = {};
      const normalizedPermissions = normalized.NormalizedPermissions || {};
      const permissionLabels = normalized.PermissionLabels || {};
      Object.keys(normalizedPermissions).forEach((permission) => {
        const displayName = permissionLabels[permission] ?? permission;
        const category = getCategoryForPermission(permission);
        if (!categories[category]) {
          categories[category] = [];
        }
        if (displayName.toLowerCase().includes(lowerFilter)) {
          categories[category].push({
            key: permission,
            name: displayName,
            crudSet: normalizedPermissions[permission]
          });
        }
      });
      permissionsByCategory = Object.fromEntries(Object.entries(categories).sort(([a], [b]) => a.localeCompare(b)));
    }
    function safeText(str) {
      return String(str ?? "");
    }
    selectedRole = store_get($$store_subs ??= {}, "$roles", roles).find((r) => r?.Name === store_get($$store_subs ??= {}, "$selectedRoleName", selectedRoleName)) ?? null;
    if (selectedRole) {
      updatePermissions();
    }
    store_get($$store_subs ??= {}, "$searchQuery", searchQuery), store_get($$store_subs ??= {}, "$selectedRoleName", selectedRoleName), updatePermissions();
    if (selectedRole) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div id="main" class="svelte-1r47inj"><div class="role-header svelte-1r47inj"><h2 class="svelte-1r47inj">${escape_html(safeText(selectedRole.FriendlyName ?? selectedRole.Name))}</h2> <div class="role-metadata svelte-1r47inj"><div class="role-meta-line svelte-1r47inj"><span class="role-meta-label svelte-1r47inj">Role ID</span> <span class="role-meta-value svelte-1r47inj"><code class="font-mono machine-string">${escape_html(safeText(selectedRole.Name ?? "N/A"))}</code></span></div> <div class="role-meta-line svelte-1r47inj"><span class="role-meta-label svelte-1r47inj">Area</span> <span class="role-meta-value font-mono svelte-1r47inj">${escape_html(safeText(selectedRole.Area ?? "N/A"))}</span></div> <div class="role-meta-line svelte-1r47inj"><span class="role-meta-label svelte-1r47inj">Rank</span> <span class="role-meta-value font-mono svelte-1r47inj">${escape_html(safeText(selectedRole.Rank ?? "N/A"))}</span></div></div> <input id="permSearch" type="text" placeholder="Search permissions…"${attr("value", store_get($$store_subs ??= {}, "$searchQuery", searchQuery))}/> <div class="legend svelte-1r47inj"><span class="role-meta-label svelte-1r47inj">CRUD legend</span> <span class="legend-values font-mono svelte-1r47inj">C R U D</span></div></div> <!--[-->`);
      const each_array = ensure_array_like(Object.entries(permissionsByCategory));
      for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
        let [category, items] = each_array[$$index_2];
        $$renderer2.push(`<div class="permission-category svelte-1r47inj"><div class="category-title svelte-1r47inj"><span>${escape_html(category)}</span> <span>▼</span></div> <div><!--[-->`);
        const each_array_1 = ensure_array_like(items);
        for (let $$index_1 = 0, $$length2 = each_array_1.length; $$index_1 < $$length2; $$index_1++) {
          let item = each_array_1[$$index_1];
          $$renderer2.push(`<div class="permission-row svelte-1r47inj"><div class="permission-name svelte-1r47inj"><div class="permission-label svelte-1r47inj">${escape_html(safeText(item.name))}</div> <div class="permission-key svelte-1r47inj"><code class="font-mono machine-string">${escape_html(safeText(item.key))}</code></div></div> <!--[-->`);
          const each_array_2 = ensure_array_like(["C", "R", "U", "D"]);
          for (let $$index = 0, $$length3 = each_array_2.length; $$index < $$length3; $$index++) {
            let letter = each_array_2[$$index];
            $$renderer2.push(`<span${attr_class(`crud-cell crud-cell--${stringify(letter.toLowerCase())}`, "svelte-1r47inj", { "enabled": item.crudSet.has(letter) })}>${escape_html(letter)}</span>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div id="main" style="display: flex; align-items: center; justify-content: center; color: var(--color-on-surface-variant);" class="svelte-1r47inj"><p>Select a role from the sidebar to view permissions</p></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function FileUpload($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let dragOver = false;
    $$renderer2.push(`<div id="runtimeSourceControls" class="svelte-ux1wx1"><h3 class="upload-title svelte-ux1wx1">Load Roles</h3> <label for="roleFileInput" class="svelte-ux1wx1">Choose JSON file(s)</label> <input id="roleFileInput" type="file" multiple="" accept=".json" class="svelte-ux1wx1"/> <p class="upload-guidance svelte-ux1wx1">or drag and drop role JSON files below</p> <div id="roleDropZone" role="region" aria-label="Drag and drop zone for role files"${attr_class("svelte-ux1wx1", void 0, { "is-drag-over": dragOver })}>Drop role files here</div> `);
    if (store_get($$store_subs ??= {}, "$errors", errors).length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="error svelte-ux1wx1"><strong>${escape_html(store_get($$store_subs ??= {}, "$errors", errors).length)} source${escape_html(store_get($$store_subs ??= {}, "$errors", errors).length === 1 ? "" : "s")} failed</strong> <details><summary>Show details</summary> <ul><!--[-->`);
      const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$errors", errors));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let err = each_array[$$index];
        $$renderer2.push(`<li>${escape_html(err.source)}${escape_html(err.type ? ` (${err.type})` : "")}${escape_html(err.message ? `: ${err.message}` : "")}</li>`);
      }
      $$renderer2.push(`<!--]--></ul></details></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let data = $$props["data"];
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>CRUD Mapper - Role Permissions</title>`);
      });
      $$renderer3.push(`<meta name="description" content="CRUD Mapper - Role permission explorer and visualizer"/>`);
    });
    if (store_get($$store_subs ??= {}, "$roles", roles).length === 0) {
      $$renderer2.push("<!--[0-->");
      FileUpload($$renderer2);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div id="app-container" class="svelte-1uha8ag">`);
      Sidebar($$renderer2);
      $$renderer2.push(`<!----> `);
      RoleDetail($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { data });
  });
}
export {
  _page as default
};
