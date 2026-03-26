<script lang="ts">
  import { roles, errors } from '$lib/stores/roles.js';
  import { loadRolesFromFiles } from '$lib/dataLoader.js';

  let dragOver = false;
  let fileInput: HTMLInputElement | null = null;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const result = await loadRolesFromFiles(fileArray);

    roles.set(result.roles);
    errors.set(result.errors);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    handleFiles(e.dataTransfer?.files ?? null);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  function handleFileInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    handleFiles(input.files);
  }
</script>

<div id="runtimeSourceControls">
  <h3 class="upload-title">Load Roles</h3>

  <label for="roleFileInput">
    Choose JSON file(s)
  </label>

  <input
    id="roleFileInput"
    bind:this={fileInput}
    type="file"
    multiple
    accept=".json"
    on:change={handleFileInputChange}
  />

  <p class="upload-guidance">
    or drag and drop role JSON files below
  </p>

  <div
    id="roleDropZone"
    class:is-drag-over={dragOver}
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    role="region"
    aria-label="Drag and drop zone for role files"
  >
    Drop role files here
  </div>

  {#if $errors.length > 0}
    <div class="error">
      <strong>{$errors.length} source{$errors.length === 1 ? '' : 's'} failed</strong>
      <details>
        <summary>Show details</summary>
        <ul>
          {#each $errors as err}
            <li>
              {err.source}{err.type ? ` (${err.type})` : ''}{err.message ? `: ${err.message}` : ''}
            </li>
          {/each}
        </ul>
      </details>
    </div>
  {/if}
</div>

<style>
  #runtimeSourceControls {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
    padding: 1rem;
    background: linear-gradient(
      150deg,
      color-mix(in srgb, var(--color-surface-container-lowest) 88%, white),
      color-mix(in srgb, var(--color-surface-container-low) 82%, white)
    );
    border: 1px solid color-mix(in srgb, var(--color-outline-variant) 28%, transparent);
    border-radius: 12px;
    box-shadow:
      0 1px 0 color-mix(in srgb, var(--color-surface-bright) 78%, transparent) inset,
      var(--shadow-ambient-sm);
  }

  .upload-title {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 680;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-on-surface-variant);
  }

  label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.6rem;
    padding: 0.55rem 1rem;
    border-radius: 8px;
    border: none;
    background: linear-gradient(145deg, var(--color-primary), var(--color-primary-dim));
    color: var(--color-on-primary);
    font-weight: 600;
    cursor: pointer;
    transition:
      transform 120ms ease,
      box-shadow 160ms ease,
      filter 160ms ease;
  }

  label:hover {
    filter: brightness(1.04);
    box-shadow: 0 3px 10px color-mix(in srgb, var(--color-primary) 24%, transparent);
  }

  label:active {
    transform: translateY(1px);
  }

  label:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  #roleFileInput {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    clip: rect(0, 0, 0, 0);
    overflow: hidden;
    white-space: nowrap;
  }

  #roleFileInput:focus-visible ~ #roleDropZone {
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  .upload-guidance {
    margin: 0;
    color: var(--color-on-surface-variant);
    font-size: 0.85rem;
    line-height: 1.35;
  }

  #roleDropZone {
    border: 1px solid color-mix(in srgb, var(--color-outline-variant) 34%, transparent);
    border-radius: 8px;
    color: var(--color-on-surface-variant);
    background: color-mix(
      in srgb,
      var(--color-surface-container-low) 76%,
      var(--color-surface-container-lowest)
    );
    padding: 0.65rem 0.9rem;
    text-align: center;
    position: relative;
    transition:
      border-color 140ms ease,
      background-color 140ms ease,
      box-shadow 140ms ease,
      color 140ms ease;
  }

  #roleDropZone::before {
    content: '';
    position: absolute;
    inset: 7px;
    border-radius: 6px;
    border: 1px dashed color-mix(in srgb, var(--color-outline) 45%, transparent);
    opacity: 0;
    pointer-events: none;
    transition:
      opacity 140ms ease,
      border-color 140ms ease;
  }

  #roleDropZone.is-drag-over {
    border-color: color-mix(in srgb, var(--color-primary) 42%, var(--color-outline));
    background: color-mix(
      in srgb,
      var(--color-primary-container) 60%,
      var(--color-surface-container-low)
    );
    color: var(--color-on-primary-container);
  }

  #roleDropZone.is-drag-over::before,
  #roleDropZone:focus-visible::before,
  #roleFileInput:focus-visible ~ #roleDropZone::before {
    opacity: 1;
    border-color: color-mix(in srgb, var(--color-primary) 58%, var(--color-outline));
  }

  #roleDropZone:focus-visible {
    outline: none;
    border-color: color-mix(in srgb, var(--color-primary) 45%, var(--color-outline));
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  .error {
    color: var(--color-danger);
    font-weight: bold;
    margin: 1rem 0;
  }
</style>
