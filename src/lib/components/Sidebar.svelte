<script lang="ts">
  import { roles, errors } from '$lib/stores/roles.js';
  import { selectedRoleName } from '$lib/stores/ui.js';
  import { expandedAreas } from '$lib/stores/areas.js';
  import { persistAreaState } from '$lib/persistence.js';
  import { groupByArea } from '$lib/dataLoader.js';
  import type { NormalizedRole, RolesByArea } from '$lib/types.js';

  let rolesByArea: RolesByArea = {};

  $: rolesByArea = groupByArea($roles);

  function toggleArea(areaName: string) {
    const newExpanded = new Set($expandedAreas);
    if (newExpanded.has(areaName)) {
      newExpanded.delete(areaName);
    } else {
      newExpanded.add(areaName);
    }
    expandedAreas.set(newExpanded);
    persistAreaState(areaName, newExpanded.has(areaName));
  }

  function selectRole(role: NormalizedRole) {
    selectedRoleName.set(role.Name);
  }
</script>

<div id="sidebar">
  {#if $roles.length === 0}
    <p style="color: var(--color-on-surface-variant); font-size: 0.9rem;">
      No roles loaded. Upload role files to get started.
    </p>
  {:else}
    {#each Object.keys(rolesByArea).sort() as area (area)}
      <div class="area-title" on:click={() => toggleArea(area)} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && toggleArea(area)}>
        <span>{area}</span>
        <span class="area-icon">{$expandedAreas.has(area) ? '▼' : '▶'}</span>
      </div>
      {#if $expandedAreas.has(area)}
        <div>
          {#each rolesByArea[area] as role (role.Name)}
            <div
              class="role-name"
              class:is-selected={$selectedRoleName === role.Name}
              on:click={() => selectRole(role)}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === 'Enter' && selectRole(role)}
            >
              {role.Name}
            </div>
          {/each}
        </div>
      {/if}
    {/each}
  {/if}
</div>

<style>
  #sidebar {
    width: 260px;
    background: var(--color-surface-dim);
    color: var(--color-on-surface);
    overflow-y: auto;
    padding: 1rem;
    border-right: 1px solid color-mix(in srgb, var(--color-outline-variant) 28%, transparent);
  }

  .area-title {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    font-weight: 560;
    border-left: 2px solid transparent;
    transition:
      background-color 140ms ease,
      border-left-color 140ms ease,
      font-weight 140ms ease;
  }

  .area-title:hover {
    background: color-mix(in srgb, var(--color-surface-container-high) 58%, transparent);
  }

  .area-title:active,
  .area-title:focus-visible {
    border-left-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary-container) 14%, transparent);
    font-weight: 600;
  }

  .area-icon {
    margin-left: 8px;
  }

  .role-name {
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    border-radius: 2px;
    border-left: 2px solid transparent;
    font-weight: 480;
    transition:
      background-color 140ms ease,
      border-left-color 140ms ease,
      font-weight 140ms ease;
  }

  .role-name:hover {
    background: color-mix(in srgb, var(--color-surface-container-highest) 48%, transparent);
  }

  .role-name.is-selected {
    border-left-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary-container) 12%, transparent);
    font-weight: 600;
  }

  .role-name:active,
  .role-name:focus-visible {
    border-left-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary-container) 16%, transparent);
    font-weight: 600;
  }

  .role-name.is-selected:hover,
  .role-name.is-selected:focus-visible {
    background: color-mix(in srgb, var(--color-primary-container) 20%, transparent);
  }
</style>
