<script lang="ts">
  import { roles, errors } from '$lib/stores/roles.js';
  import { loadRolesFromFiles } from '$lib/dataLoader.js';

  let dragOver = false;
  let fileInput: HTMLInputElement | null = null;
  let isLoading = false;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    isLoading = true;

    const fileArray = Array.from(files);
    const result = await loadRolesFromFiles(fileArray);

    roles.set(result.roles);
    errors.set(result.errors);
    isLoading = false;
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

<div class="upload-container">
  <!-- Hero Section -->
  <div class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">The Precision Architect</h1>
      <p class="hero-subtitle">Transform unstructured role data into actionable architectural intelligence</p>
    </div>
  </div>

  <!-- Main Grid Layout -->
  <div class="grid-layout">
    <!-- Drop Zone (8 cols) -->
    <div class="drop-zone-container">
      <div
        id="roleDropZone"
        class:is-drag-over={dragOver}
        on:drop={handleDrop}
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        role="region"
        aria-label="Drag and drop zone for role files"
      >
        {#if isLoading}
          <div class="drop-zone-content loading">
            <div class="spinner"></div>
            <span>Processing files...</span>
          </div>
        {:else if dragOver}
          <div class="drop-zone-content active">
            <span class="drop-icon">📁</span>
            <span>Drop here to upload</span>
          </div>
        {:else}
          <div class="drop-zone-content">
            <span class="drop-icon">📂</span>
            <p class="drop-label">Drag & drop role JSON files</p>
            <p class="drop-hint">or click the button below</p>
          </div>
        {/if}
      </div>

      <label for="roleFileInput" class="file-button">
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
    </div>

    <!-- Info Cards (4 cols) -->
    <div class="info-cards">
      <div class="info-card">
        <h3 class="card-title">Schema Requirements</h3>
        <ul class="card-list">
          <li>Valid JSON format</li>
          <li>Role definitions</li>
          <li>Permission mappings</li>
          <li>Area categorization</li>
        </ul>
      </div>

      <div class="info-card">
        <h3 class="card-title">Parser Status</h3>
        <div class="status-indicator">
          <div class="status-dot {$roles.length > 0 ? 'active' : 'idle'}"></div>
          <span class="status-text">
            {#if $roles.length === 0}
              Ready to parse
            {:else}
              {$roles.length} role{$roles.length === 1 ? '' : 's'} loaded
            {/if}
          </span>
        </div>
        {#if $errors.length > 0}
          <div class="error-summary">
            <strong>{$errors.length} error{$errors.length === 1 ? '' : 's'}</strong>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Features Section -->
  <div class="features-section">
    <h2 class="features-title">Key Capabilities</h2>
    <div class="features-grid">
      <div class="feature">
        <div class="feature-icon">🏗️</div>
        <h4>Architectural Blueprint</h4>
        <p>Visualize role hierarchies and permission structures at scale</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🎨</div>
        <h4>Tonal Layering</h4>
        <p>Color-coded CRUD operations for intuitive permission analysis</p>
      </div>
      <div class="feature">
        <div class="feature-icon">✏️</div>
        <h4>Editorial Precision</h4>
        <p>Fine-grained search and filtering of complex role data</p>
      </div>
    </div>
  </div>

  <!-- Error Display -->
  {#if $errors.length > 0}
    <div class="error-panel">
      <strong>{$errors.length} source{$errors.length === 1 ? '' : 's'} failed to parse</strong>
      <details class="error-details">
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
  .upload-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  /* Hero Section */
  .hero-section {
    background: linear-gradient(135deg, #565e74, #4a5268);
    color: white;
    padding: 4rem 2rem;
    text-align: center;
    flex-shrink: 0;
  }

  .hero-content {
    max-width: 1000px;
    margin: 0 auto;
  }

  .hero-title {
    margin: 0 0 0.75rem;
    font-size: 2.4rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .hero-subtitle {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 400;
    opacity: 0.95;
    line-height: 1.4;
  }

  /* Main Grid Layout */
  .grid-layout {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.75rem;
    padding: 2.5rem;
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  /* Drop Zone Container */
  .drop-zone-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  #roleDropZone {
    flex: 1;
    border: 2px dashed color-mix(in srgb, var(--color-outline-variant) 50%, transparent);
    border-radius: 12px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-surface-container-lowest) 95%, white),
      color-mix(in srgb, var(--color-surface-container-low) 85%, white)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 320px;
    transition:
      all 200ms ease;
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }

  #roleDropZone::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(88, 94, 116, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(74, 82, 104, 0.02) 0%, transparent 50%);
    pointer-events: none;
  }

  #roleDropZone.is-drag-over {
    border-color: var(--color-primary);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-primary-container) 40%, white),
      color-mix(in srgb, var(--color-surface-container-low) 60%, white)
    );
    box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary) 18%, transparent);
  }

  .drop-zone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
    z-index: 1;
    transition: all 200ms ease;
  }

  .drop-zone-content.loading {
    gap: 1rem;
  }

  .drop-zone-content.active {
    gap: 0.5rem;
  }

  .drop-icon {
    font-size: 3.5rem;
    display: block;
    opacity: 0.8;
    transition: all 200ms ease;
  }

  #roleDropZone.is-drag-over .drop-icon {
    transform: scale(1.15);
    opacity: 1;
  }

  .drop-label {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--color-on-surface);
    letter-spacing: -0.01em;
  }

  .drop-hint {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-on-surface-variant);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .file-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    background: linear-gradient(145deg, var(--color-primary), var(--color-primary-dim));
    color: var(--color-on-primary);
    border: none;
    cursor: pointer;
    transition: all 200ms ease;
    align-self: flex-start;
  }

  .file-button:hover {
    filter: brightness(1.05);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 28%, transparent);
    transform: translateY(-1px);
  }

  .file-button:active {
    transform: translateY(0);
  }

  .file-button:focus-visible {
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

  /* Info Cards */
  .info-cards {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .info-card {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-surface-container-lowest) 98%, white),
      color-mix(in srgb, var(--color-surface-container-low) 80%, white)
    );
    border: 1px solid color-mix(in srgb, var(--color-outline-variant) 25%, transparent);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: var(--shadow-ambient-sm);
    transition: all 200ms ease;
  }

  .info-card:hover {
    border-color: color-mix(in srgb, var(--color-outline-variant) 45%, transparent);
    box-shadow: var(--shadow-ambient-md);
    transform: translateY(-2px);
  }

  .card-title {
    margin: 0 0 1rem;
    font-size: 0.95rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-on-surface);
  }

  .card-list {
    margin: 0;
    padding-left: 1.25rem;
    list-style: none;
  }

  .card-list li {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: var(--color-on-surface-variant);
    position: relative;
    padding-left: 0.5rem;
  }

  .card-list li::before {
    content: '✓';
    position: absolute;
    left: -1rem;
    color: var(--color-primary);
    font-weight: 700;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transition: all 200ms ease;
  }

  .status-dot.active {
    background: #4ade80;
    box-shadow: 0 0 8px rgba(74, 222, 128, 0.4);
    animation: pulse 2s ease-in-out infinite;
  }

  .status-dot.idle {
    background: color-mix(in srgb, var(--color-on-surface-variant) 40%, transparent);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .status-text {
    font-size: 0.9rem;
    color: var(--color-on-surface);
    font-weight: 500;
  }

  .error-summary {
    padding: 0.75rem;
    border-radius: 6px;
    background: color-mix(in srgb, var(--crud-d-bg) 15%, transparent);
    color: var(--color-danger);
    font-size: 0.85rem;
  }

  /* Features Section */
  .features-section {
    background: var(--color-surface-container-low);
    padding: 3rem 2rem;
    border-top: 1px solid color-mix(in srgb, var(--color-outline-variant) 20%, transparent);
  }

  .features-title {
    margin: 0 0 2rem;
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    color: var(--color-on-surface);
    letter-spacing: -0.01em;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature {
    background: var(--color-surface);
    padding: 1.75rem;
    border-radius: 10px;
    text-align: center;
    border: 1px solid color-mix(in srgb, var(--color-outline-variant) 20%, transparent);
    transition: all 200ms ease;
  }

  .feature:hover {
    border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-outline-variant));
    box-shadow: var(--shadow-ambient-sm);
    transform: translateY(-4px);
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
    display: block;
  }

  .feature h4 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-on-surface);
  }

  .feature p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-on-surface-variant);
    line-height: 1.5;
  }

  /* Error Panel */
  .error-panel {
    background: color-mix(in srgb, var(--crud-d-bg) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--crud-d-bg) 30%, transparent);
    border-radius: 8px;
    padding: 1.25rem;
    margin: 0 2rem 2rem;
    color: var(--color-danger);
  }

  .error-panel strong {
    display: block;
    margin-bottom: 0.75rem;
    font-size: 0.95rem;
  }

  .error-details {
    margin: 0;
    font-size: 0.85rem;
  }

  .error-details summary {
    cursor: pointer;
    color: var(--color-danger);
    text-decoration: underline;
    transition: opacity 140ms ease;
  }

  .error-details summary:hover {
    opacity: 0.8;
  }

  .error-details ul {
    margin: 0.75rem 0 0;
    padding-left: 1.5rem;
    list-style: disc;
  }

  .error-details li {
    margin-bottom: 0.35rem;
    line-height: 1.4;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .grid-layout {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .hero-title {
      font-size: 2rem;
    }

    .hero-subtitle {
      font-size: 0.95rem;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
