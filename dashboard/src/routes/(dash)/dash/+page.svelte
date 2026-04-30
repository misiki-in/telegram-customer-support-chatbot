<script lang="ts">
	import { onMount } from 'svelte';
	import { GET, POST } from '$lib/fetch';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { X, Zap} from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';

	let projects: any[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);

	// Modal state
	let showModal = $state(false);
	let projectName = $state('');
  let chatId = $state('');
	let creating = $state(false);

	onMount(async () => {
		try {
			projects = await GET(fetch, '/api/project/my');
			loading = false;
		} catch (e: any) {
			error = e.message;
			loading = false;
		}
	});

	async function createProject() {
		if (!projectName.trim()) {
			toast.error('Project name is required');
			return;
		}

		creating = true;
		try {
			const res = await POST(fetch, '/api/project', { name: projectName.trim(), chatId });
			toast.success('Project created successfully!');
			showModal = false;
			projectName = '';
			await goto(`/dash/projects/${res.id}`);
		} catch (e: any) {
			toast.error(e.message || 'Failed to create project');
		} finally {
			creating = false;
		}
	}

	function closeModal() {
		showModal = false;
		projectName = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && showModal) {
			closeModal();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-gray-50 p-4 md:p-8">
	<div class="max-w-7xl mx-auto">
		<header class="mb-8">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">Projects</h1>
					<p class="text-gray-600 mt-2">Manage projects</p>
				</div>
        <Button onclick={() => showModal = true}>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Add Project
        </Button>
			</div>
		</header>

		{#if loading}
			<div class="flex justify-center items-center py-20">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
			</div>
		{:else if error}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4">
				<p class="text-red-800">Error loading projects: {error}</p>
			</div>
		{:else if projects.length === 0}
			<div class="bg-white rounded-lg border border-gray-200 p-12 text-center">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
					/>
				</svg>
				<h3 class="mt-4 text-lg font-medium text-gray-900">No projects yet</h3>
				<p class="mt-2 text-gray-600">Get started by creating your first project.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
				{#each projects as project (project.id)}
					<ProjectCard {project} />
				{/each}
			</div>
		{/if}
	</div>
</div>

{#if showModal}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
		onclick={closeModal}
		role="button"
		tabindex="0"
		aria-label="Close modal"
	></div>

	<!-- Modal -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div
			class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
				<h2 id="modal-title" class="text-lg font-semibold text-gray-900">Create New Project</h2>
				<Button
					variant="ghost"
					onclick={closeModal}
					class="rounded-lg p-2"
					aria-label="Close"
				>
					<X class="h-5 w-5" />
				</Button>
			</div>

			<!-- Content -->
			<form onsubmit={(e) => { e.preventDefault(); createProject(); }} class="px-6 py-6">
				<div class="space-y-4">
					<div>
						<label for="project-name" class="block text-sm font-medium text-gray-700 mb-2">
							Project Name
						</label>
						<Input
							type="text"
							id="project-name"
							name="project-name"
							placeholder="Enter project name"
							bind:value={projectName}
							required
							disabled={creating}
							maxlength={100}
							class="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-black/20 disabled:bg-gray-50 transition-colors"
						/>
						<p class="mt-2 text-xs text-gray-500">{projectName.length}/100 characters</p>
					</div>
          <div>
						<label for="project-name" class="block text-sm font-medium text-gray-700 mb-2">
							Chat ID
						</label>
						<Input
							type="text"
							id="chat-id"
							name="chat-id"
							placeholder="Enter Chat ID"
							bind:value={chatId}
							required
							disabled={creating}
							maxlength={100}
							class="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-black/20 disabled:bg-gray-50 transition-colors"
						/>
						<p class="mt-2 text-xs text-gray-500">{chatId.length}/100 characters</p>
					</div>
				</div>

				<!-- Actions -->
				<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2">
					<Button
						type="button"
						variant="secondary"
						onclick={closeModal}
						disabled={creating}
						class="w-full sm:w-auto px-4 py-3"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={creating || !projectName.trim()}
						class="w-full sm:w-auto px-4 py-3"
					>
						{#if creating}
							<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<span>Creating...</span>
						{:else}
							<span>Create project</span>
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
