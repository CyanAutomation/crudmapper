<script lang="ts">
	import { onMount } from 'svelte';
	import { roles, errors } from '$lib/stores/roles.js';
	import { initializeAreaPersistence } from '$lib/persistence.js';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import RoleDetail from '$lib/components/RoleDetail.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	onMount(() => {
		// Initialize with data from loader
		if (data.initialRoles && data.initialRoles.length > 0) {
			roles.set(data.initialRoles);
		}
		if (data.initialErrors && data.initialErrors.length > 0) {
			errors.set(data.initialErrors);
		}

		// Initialize area persistence (load/save collapsed state)
		initializeAreaPersistence();
	});
</script>

<svelte:head>
	<title>CRUD Mapper - Role Permissions</title>
	<meta name="description" content="CRUD Mapper - Role permission explorer and visualizer" />
</svelte:head>

{#if $roles.length === 0}
	<FileUpload />
{:else}
	<div id="app-container">
		<Sidebar />
		<RoleDetail />
	</div>
{/if}


<style>
	#app-container {
		display: flex;
		flex: 1;
		min-height: 0;
		border-radius: 10px;
		overflow: hidden;
		background: var(--color-surface-container-lowest);
	}

	@media (max-width: 1024px) {
		#app-container {
			flex-direction: column;
		}

		:global(#sidebar) {
			width: 100%;
			max-height: 32vh;
			border-right: 0;
			border-bottom: 1px solid color-mix(in srgb, var(--color-outline-variant) 28%, transparent);
		}

		:global(.workspace-main) {
			min-height: 0;
		}

		:global(#main) {
			padding: 1.4rem;
		}
	}

	@media (max-width: 768px) {
		:global(.app-content) {
			padding: 0.65rem;
			gap: 0.75rem;
		}

		:global(#runtimeSourceControls) {
			gap: 0.55rem;
			padding: 0.8rem;
		}

		:global(#runtimeSourceControls label[for="roleFileInput"]) {
			width: 100%;
		}

		:global(.role-header) {
			top: 0;
			padding: 0.8rem;
		}

		:global(.role-header h2) {
			font-size: 1.6rem;
		}

		:global(.permission-category) {
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}

		:global(.permission-row) {
			min-width: 30rem;
		}
	}

	@media (max-width: 560px) {
		:global(#sidebar) {
			max-height: 40vh;
			padding: 0.75rem;
		}

		:global(.role-meta-line) {
			flex-wrap: wrap;
			gap: 0.2rem 0.45rem;
		}

		:global(.permission-row) {
			min-width: 27rem;
			padding: 0.38rem 0.55rem;
			font-size: 0.72rem;
		}

		:global(.permission-label),
		:global(.permission-key) {
			line-height: 1.3;
		}
	}
</style>
