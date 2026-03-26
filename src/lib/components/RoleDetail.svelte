<script lang="ts">
  import { roles } from '$lib/stores/roles.js';
  import { selectedRoleName } from '$lib/stores/ui.js';
  import { searchQuery } from '$lib/stores/search.js';
  import { getCategoryForPermission } from '$lib/categoryMap.js';
  import type { NormalizedRole } from '$lib/types.js';

  interface PermissionItem {
    key: string;
    name: string;
    crudSet: Set<string>;
  }

  let selectedRole: NormalizedRole | null = null;
  let permissionsByCategory: Record<string, PermissionItem[]> = {};

  $: selectedRole = $roles.find((r) => r.Name === $selectedRoleName) ?? null;

  $: if (selectedRole) {
    updatePermissions();
  }

  function updatePermissions() {
    if (!selectedRole) return;
    
    const lowerFilter = $searchQuery.toLowerCase();
    const categories: Record<string, PermissionItem[]> = {};

    const normalizedPermissions = (selectedRole.NormalizedPermissions as Record<string, Set<string>>) || {};
    const permissionLabels = (selectedRole.PermissionLabels as Record<string, string>) || {};

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
          crudSet: normalizedPermissions[permission],
        });
      }
    });

    permissionsByCategory = Object.fromEntries(
      Object.entries(categories).sort(([a], [b]) => a.localeCompare(b))
    );
  }

  $: $searchQuery, $selectedRoleName, updatePermissions();

  function safeText(str: unknown): string {
    return String(str ?? '');
  }
</script>

{#if selectedRole}
  <div id="main">
    <div class="role-header">
      <h2>{safeText((selectedRole.FriendlyName as string | undefined) ?? (selectedRole.Name as string | undefined))}</h2>
      <div class="role-metadata">
        <div class="role-meta-line">
          <span class="role-meta-label">Role ID</span>
          <span class="role-meta-value">
            <code class="font-mono machine-string">{safeText(selectedRole.Name ?? 'N/A')}</code>
          </span>
        </div>
        <div class="role-meta-line">
          <span class="role-meta-label">Area</span>
          <span class="role-meta-value font-mono">{safeText(selectedRole.Area ?? 'N/A')}</span>
        </div>
        <div class="role-meta-line">
          <span class="role-meta-label">Rank</span>
          <span class="role-meta-value font-mono">{safeText(selectedRole.Rank ?? 'N/A')}</span>
        </div>
      </div>

      <input
        id="permSearch"
        type="text"
        placeholder="Search permissions…"
        bind:value={$searchQuery}
      />
      <div class="legend">
        <span class="role-meta-label">CRUD legend</span>
        <span class="legend-values font-mono">C R U D</span>
      </div>
    </div>

    {#each Object.entries(permissionsByCategory) as [category, items] (category)}
      <div class="permission-category">
        <div class="category-title">
          <span>{category}</span>
          <span>▼</span>
        </div>
        <div>
          {#each items as item (item.key)}
            <div class="permission-row">
              <div class="permission-name">
                <div class="permission-label">{safeText(item.name)}</div>
                <div class="permission-key">
                  <code class="font-mono machine-string">{safeText(item.key)}</code>
                </div>
              </div>

              {#each ['C', 'R', 'U', 'D'] as letter (letter)}
                <span
                  class="crud-cell crud-cell--{letter.toLowerCase()}"
                  class:enabled={item.crudSet.has(letter)}
                >
                  {letter}
                </span>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{:else}
  <div id="main" style="display: flex; align-items: center; justify-content: center; color: var(--color-on-surface-variant);">
    <p>Select a role from the sidebar to view permissions</p>
  </div>
{/if}

<style>
  #main {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    background: var(--color-surface);
  }

  .role-header {
    background: var(--color-surface-container-lowest);
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 6px;
    position: sticky;
    top: 0;
    z-index: 20;
    box-shadow: var(--shadow-ambient-sm);
  }

  .role-header h2 {
    margin: 0 0 0.6rem;
    font-size: 2.25rem;
    line-height: 1.08;
    font-weight: 780;
    letter-spacing: -0.015em;
  }

  .role-metadata {
    display: grid;
    gap: 0.35rem;
    margin-bottom: 0.75rem;
  }

  .role-meta-line {
    display: flex;
    align-items: baseline;
    justify-content: flex-start;
    gap: 0.55rem;
  }

  .role-meta-label {
    font-size: 0.62rem;
    font-weight: 720;
    text-transform: uppercase;
    letter-spacing: 0.11em;
    color: color-mix(in srgb, var(--color-on-surface) 86%, black);
  }

  .role-meta-value {
    font-size: 0.78rem;
    color: color-mix(in srgb, var(--color-on-surface) 92%, black);
  }

  .legend {
    margin-top: 0.65rem;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .legend-values {
    font-size: 0.74rem;
    color: color-mix(in srgb, var(--color-on-surface) 90%, black);
  }

  :global(#permSearch) {
    width: 100%;
    padding: 0.6rem;
    margin-top: 1rem;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent);
    border-bottom: 2px solid color-mix(in srgb, var(--color-outline) 44%, transparent);
    background: var(--color-surface-container-lowest);
    color: var(--color-on-surface);
    font-size: 15px;
    transition:
      border-color 140ms ease,
      box-shadow 140ms ease,
      background-color 140ms ease;
  }

  :global(#permSearch:focus) {
    outline: none;
    border-color: color-mix(in srgb, var(--color-primary) 70%, var(--color-outline));
    border-bottom-color: var(--focus-underline);
    box-shadow: 0 0 0 3px var(--focus-ring);
    background: var(--color-surface-container-low);
  }

  .permission-category {
    background: var(--color-surface-container-low);
    margin-bottom: 0.9rem;
    border-radius: 6px;
    overflow: hidden;
  }

  .category-title {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    background: var(--color-surface-container-lowest);
  }

  .category-title:hover {
    background: color-mix(
      in srgb,
      var(--color-surface-container-lowest) 86%,
      var(--color-surface-container-low)
    );
  }

  .permission-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) repeat(4, var(--crud-col-width));
    column-gap: 0.35rem;
    padding: 0.55rem 0.7rem;
    align-items: center;
    border: 0;
    font-size: 0.75rem;
    line-height: 1.42;
    transition: background-color 140ms ease;
  }

  .permission-row:nth-child(even) {
    background: var(--color-surface-container-low);
  }

  .permission-row:nth-child(odd) {
    background: var(--color-surface-container-lowest);
  }

  .permission-row:hover {
    background: color-mix(in srgb, var(--color-primary-container) 8%, var(--color-surface-container-lowest));
  }

  .permission-name {
    flex: 1;
    display: grid;
    gap: 0.05rem;
  }

  .permission-label {
    font-size: 0.75rem;
    color: color-mix(in srgb, var(--color-on-surface) 84%, var(--color-on-surface-variant));
  }

  .permission-key {
    font-size: 0.72rem;
    letter-spacing: 0.01em;
    color: color-mix(in srgb, var(--color-on-surface) 88%, black);
  }

  :global(code.font-mono),
  :global(code.machine-string) {
    padding: 0.08rem 0.24rem;
    border-radius: 0.22rem;
    background: color-mix(in srgb, var(--color-surface-container-high) 78%, transparent);
    font-size: 0.95em;
    line-height: 1.35;
  }

  .permission-key :global(code) {
    padding: 0;
    border-radius: 0;
    background: none;
  }

  .crud-cell {
    width: var(--crud-col-width);
    height: 1.25rem;
    border-radius: 0.35rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    background: var(--color-surface-container-high);
    color: color-mix(in srgb, var(--color-on-surface-variant) 50%, transparent);
    opacity: 0.5;
    transition: all 140ms ease;
    cursor: default;
  }

  .crud-cell.enabled {
    background: var(--crud-bg);
    color: var(--crud-fg);
    opacity: 1;
    font-weight: 720;
    box-shadow: 0 2px 4px color-mix(in srgb, var(--crud-bg) 30%, transparent);
  }

  .permission-row:hover .crud-cell.enabled {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px color-mix(in srgb, var(--crud-bg) 40%, transparent);
    filter: brightness(1.08);
  }

  .crud-cell--c {
    --crud-bg: var(--crud-c-bg);
    --crud-fg: var(--crud-c-fg);
  }

  .crud-cell--r {
    --crud-bg: var(--crud-r-bg);
    --crud-fg: var(--crud-r-fg);
  }

  .crud-cell--u {
    --crud-bg: var(--crud-u-bg);
    --crud-fg: var(--crud-u-fg);
  }

  .crud-cell--d {
    --crud-bg: var(--crud-d-bg);
    --crud-fg: var(--crud-d-fg);
  }
</style>
