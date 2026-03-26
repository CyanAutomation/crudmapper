<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="app-shell">
	<div class="top-header">
		<div class="brand-shell">
			<p class="brand-eyebrow">CRUD Permissions</p>
			<h1 class="brand-title">Role Mapper</h1>
		</div>
	</div>

	<div class="app-content">
		{@render children()}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family:
			Inter,
			system-ui,
			-apple-system,
			"Segoe UI",
			sans-serif;
		background: var(--color-surface);
		color: var(--color-on-surface);
		min-height: 100vh;
	}

	.app-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.top-header {
		padding: 1rem 1.25rem;
		background: linear-gradient(
			120deg,
			color-mix(in srgb, var(--color-primary-container) 70%, white),
			var(--color-surface-container-lowest)
		);
	}

	.brand-shell {
		max-width: 1200px;
		margin: 0 auto;
	}

	.brand-eyebrow {
		margin: 0;
		color: var(--color-on-surface-variant);
		font-size: 0.85rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.brand-title {
		margin: 0.2rem 0 0;
		font-size: 1.4rem;
	}

	.app-content {
		display: flex;
		flex: 1;
		min-height: 0;
		flex-direction: column;
		padding: 1rem;
		gap: 1rem;
	}
</style>
