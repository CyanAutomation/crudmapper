<script lang="ts">
  import { roles, errors } from '$lib/stores/roles.js';
  import { selectedRoleName } from '$lib/stores/ui.js';
  import { expandedAreas } from '$lib/stores/areas.js';
  import { persistAreaState } from '$lib/persistence.js';
  import { groupByArea } from '$lib/dataLoader.js';
  import { slide } from 'svelte/transition';
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
    <p class="empty-state">
      No roles loaded. Upload role files to get started.
    </p>
  {:else}
    {#each Object.keys(rolesByArea).sort() as area (area)}
      <div class="area-group">
        <button
          class="area-title"
          on:click={() => toggleArea(area)}
          aria-expanded={$expandedAreas.has(area)}
          aria-label={`Toggle ${area} section`}
        >
          <span class="area-name">{area}</span>
          <div class="area-controls">
            <span class="role-count">{rolesByArea[area].length}</span>
            <svg
              class="area-icon {$expandedAreas.has(area) ? 'expanded' : ''}"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
        </button>

        {#if $expandedAreas.has(area)}
          <div class="roles-list" transition:slide={{ duration: 200 }}>
            {#each rolesByArea[area] as role (role.Name)}
              <button
                class="role-name {$selectedRoleName === role.Name ? 'is-selected' : ''}"
                on:click={() => selectRole(role)}
              >
                <span class="role-indicator"></span>
                <span class="role-label">{role.Name}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style>
  #sidebar {
    width: 260px;
    background: var(--color-surface-dim);
    color: var(--color-on-surface);
    overflow-y: auto;
    padding: 0.75rem;
    border-right: 1px solid color-mix(in srgb, var(--color-outline-variant) 28%, transparent);
    display: flex;
    flex-direction: column;
  }

  .empty-state {
    color: var(--color-on-surface-variant);
    font-size: 0.9rem;
    line-height: 1.4;
    padding: 1.5rem 0.5rem;
    text-align: center;
    margin: 0;
  }

  .area-group {
    margin-bottom: 0.5rem;
  }

  .area-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.65rem 0.75rem;
    cursor: pointer;
    font-weight: 580;
    border: none;
    border-left: 2px solid transparent;
    background: none;
    color: var(--color-on-surface);
    transition: all 140ms ease;
    border-radius: 4px;
  }

  .area-name {
    flex: 1;
    text-align: left;
    letter-spacing: -0.005em;
  }

  .area-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .role-count {
    font-size: 0.75rem;
    color: var(--color-on-surface-variant);
    font-weight: 500;
    min-width: 1.25rem;
    text-align: right;
  }

  .area-icon {
    width: 18px;
    height: 18px;
    color: var(--color-on-surface-variant);
    transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
  }

  .area-icon.expanded {
    transform: rotate(180deg);
  }

  .area-title:hover {
    background: color-mix(in srgb, var(--color-surface-container-high) 48%, transparent);
  }

  .area-title:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--focus-ring);
  }

  .area-title:active {
    border-left-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary-container) 16%, transparent);
    font-weight: 600;
  }

  .roles-list {
    padding: 0.35rem 0 0.35rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .role-name {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.4rem 0.75rem;
    margin-left: 0.35rem;
    cursor: pointer;
    border-radius: 4px;
    border: none;
    background: none;
    color: var(--color-on-surface);
    font-weight: 480;
    font-size: 0.95rem;
    transition: all 140ms ease;
    text-align: left;
    border-left: 2px solid transparent;
  }

  .role-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-on-surface-variant) 50%, transparent);
    transition: all 140ms ease;
    display: block;
    flex-shrink: 0;
  }

  .role-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .role-name:hover {
    background: color-mix(in srgb, var(--color-surface-container-highest) 48%, transparent);
  }

  .role-name:hover .role-indicator {
    background: color-mix(in srgb, var(--color-primary) 60%, transparent);
    transform: scale(1.4);
  }

  .role-name:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--focus-ring);
  }

  .role-name.is-selected {
    border-left-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary-container) 18%, transparent);
    font-weight: 600;
    color: var(--color-primary);
  }

  .role-name.is-selected .role-indicator {
    background: var(--color-primary);
    box-shadow: 0 0 6px color-mix(in srgb, var(--color-primary) 40%, transparent);
    transform: scale(1.6);
  }

  .role-name.is-selected:hover {
    background: color-mix(in srgb, var(--color-primary-container) 26%, transparent);
  }

  .role-name.is-selected:hover .role-indicator {
    transform: scale(1.8);
  }

  .role-name:active {
    background: color-mix(in srgb, var(--color-primary-container) 20%, transparent);
  }
</style>
