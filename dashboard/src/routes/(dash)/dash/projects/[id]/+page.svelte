<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { GET, POST, PUT } from '$lib/fetch';
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/Button.svelte';
	import { Pencil, X } from 'lucide-svelte';
	import Input from '$lib/components/Input.svelte';

	interface Project {
		id: string;
		ownerId: string;
		name: string;
    chatId: string;
		isActive: boolean;
		createdAt: string;
		updatedAt: string;
	}

	let project: Project | null = $state(null);
  $inspect(project)
	let loading = $state(true);
	let error: string | null = $state(null);
	let copied = $state(false);

	// Modal state
	let showNameModal = $state(false);
	let projectName = $state('');
  let chatId = $state('');
	let updatingProject = $state(false);

	function openNameModal() {
		if (project) {
			projectName = project.name;
      chatId = project.chatId
			showNameModal = true;
		}
	}

	function closeNameModal() {
		showNameModal = false;
		projectName = '';
	}

	// Sync state
	let selectedInterval = $state('');
	let updatingInterval = $state(false);
	let syncing = $state(false);
	let showSyncModal = $state(false);

	onMount(async () => {
		try {
			project = await GET<Project>(fetch, `/api/project/${page.params.id}`);
			loading = false;

			// Set initial interval from project data
			if (project?.interval?.tag) {
				selectedInterval = project.interval.tag;
			}
		} catch (e: any) {
			error = e.message;
			loading = false;
			toast.error('Failed to load project');
		}
	});

	async function updateProjectName() {
		if (!projectName.trim()) {
			toast.error('Project name is required');
			return;
		}

		updatingProject = true
		try {
			await PUT(fetch, `/api/project/${project?.id}`, { name: projectName.trim(), chatId: chatId.trim() });
			toast.success('Name updated successfully!');
			showNameModal = false;
      			// Refresh project data to show updated lastSyncedAt
			try {
				project = await GET<Project>(fetch, `/api/project/${page.params.id}`);
			} catch (e) {
				// Silently refresh fail, keep current data
			}
		} catch (e: any) {
			toast.error(e.message || 'Failed to update name');
		} finally {
      updatingProject = false
		}
	}

	async function copyKey() {
		if (project?.id) {
			await navigator.clipboard.writeText(project.id);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}

	function formatDate(dateString: string | null) {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function updateSyncInterval() {
		if (!project?.id || !selectedInterval) return;

    const domain = project.domains?.[0]
    if (!domain)
      return toast.error('No Domain associated')

		updatingInterval = true;

		try {
			await PUT(fetch, `/api/store/info`, {
				intervalTag: selectedInterval
			}, {
				'x-site-domain': domain.domain
      });

			toast.success('Sync interval updated successfully');

			// Update local project data
			if (project) {
				const newIntervalValue = project.intervalTags?.find(tag => tag === selectedInterval)
					? parseInt(selectedInterval) * 60 // assuming tag is minutes, convert to seconds
					: undefined;

				project.interval = selectedInterval
					? { tag: selectedInterval, interval: newIntervalValue || project.interval?.interval || 0 }
					: undefined;
			}
		} catch (e: any) {
			toast.error(e instanceof Error ? e.message : 'Failed to update sync interval');
		} finally {
			updatingInterval = false;
		}
	}

	async function triggerSync() {
		if (!project?.id) return;
    
    const domain = project.domains?.[0]
    if (!domain)
      return toast.error('No Domain associated')

		syncing = true;

		try {
			// Using the correct endpoint as per the PHP plugin
			const response = await POST(fetch, `/api/store/sync`, {}, {
				'x-site-domain': domain.domain
			});

			toast.success('Sync triggered successfully');

			// Refresh project data to show updated lastSyncedAt
			try {
				project = await GET<Project>(fetch, `/api/project/${page.params.id}`);
			} catch (e) {
				// Silently refresh fail, keep current data
			}
		} catch (e: any) {
			toast.error(e instanceof Error ? e.message : 'Failed to trigger sync');
		} finally {
			syncing = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (showNameModal) closeNameModal();
			if (showSyncModal) showSyncModal = false;
		}
	}
</script>

<svelte:head>
	<title>{project?.name || 'Project'} | AeroSearch</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-gray-50 p-4 md:p-8">
	<div class="max-w-6xl mx-auto">
		<header class="mb-8">
			<Button
				variant="ghost"
				onclick={() => goto('/dash')}
				class="mb-4"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back to dash
			</Button>

			{#if loading}
				<div class="flex justify-center items-center py-20">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
				</div>
			{:else if error}
				<div class="bg-red-50 border border-red-200 rounded-lg p-4">
					<p class="text-red-800">Error loading project: {error}</p>
				</div>
			{:else if project}
				<div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
					<div>
						<div class="flex items-center gap-3">
							<h1 class="text-3xl font-bold text-gray-900">{project.name}</h1>
							<Button
								variant="ghost"
								onclick={openNameModal}
								class="rounded-full p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
								aria-label="Edit project name"
							>
								<Pencil class="h-5 w-5" />
							</Button>
						</div>
						<p class="text-gray-600 mt-2">Project ID: <code class="text-sm bg-gray-100 px-2 py-1 rounded">{project.id}</code></p>
					</div>

					<div class="flex flex-col sm:flex-row gap-2 sm:gap-2">
						<Button
							onclick={copyKey}
							class={copied ? 'bg-green-600 hover:bg-green-700' : ''}
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
								/>
							</svg>
							{copied ? 'Key copied!' : 'Copy Key'}
						</Button>

						<!-- <Button
							variant="secondary"
							onclick={() => goto(`/dash/projects/${project?.id}/analytics`)}
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
							View Analytics
						</Button> -->
					</div>
				</div>

				<div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<div class="bg-white rounded-xl border border-gray-200 p-6">
						<h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Status</h3>
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 rounded-full {project.isActive ? 'bg-green-500' : 'bg-gray-400'}"></div>
							<span class="text-lg font-semibold {project.isActive ? 'text-green-700' : 'text-gray-700'}">
								{project.isActive ? 'Active' : 'Inactive'}
							</span>
						</div>
					</div>

					<div class="bg-white rounded-xl border border-gray-200 p-6">
						<h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Chat ID</h3>
						<p class="text-lg font-semibold text-gray-900">{project.chatId}</p>
					</div>

					<div class="bg-white rounded-xl border border-gray-200 p-6">
						<h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Created</h3>
						<p class="text-lg font-semibold text-gray-900">{formatDate(project.createdAt)}</p>
					</div>

					<!-- <div class="bg-white rounded-xl border border-gray-200 p-6">
						<h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Owner ID</h3>
						<p class="text-lg font-semibold text-gray-900 truncate">{project.ownerId}</p>
					</div> -->

					<div class="bg-white rounded-xl border border-gray-200 p-6">
						<h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Updated</h3>
						<p class="text-lg font-semibold text-gray-900">{formatDate(project.updatedAt)}</p>
					</div>
				</div>
			{/if}
		</header>
	</div>

	<!-- Edit Sync Interval Modal -->
	{#if showSyncModal}
		<div class="fixed inset-0 z-50 overflow-y-auto" style="display: flex; align-items: center; justify-content: center;">
			<!-- Backdrop -->
			<div
				class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
				onclick={() => showSyncModal = false}
				onkeydown={(e) => e.key === 'Escape' && (showSyncModal = false)}
				tabindex="-1"
				role="presentation"
			></div>

			<!-- Modal Panel -->
			<div class="relative z-10 w-full max-w-md mx-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
				<div class="bg-white rounded-xl shadow-2xl">
					<div class="px-6 py-4 border-b border-gray-200">
						<h3 id="modal-title" class="text-lg font-semibold text-gray-900">Edit Sync Interval</h3>
					</div>
					<div class="p-6">
						<label for="modal-sync-interval" class="block text-sm font-medium text-gray-700 mb-2">
							Choose sync interval
						</label>
						<select
							id="modal-sync-interval"
							bind:value={selectedInterval}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
						>
							{#each project?.intervalTags || [] as tag}
								<option value={tag}>{tag}</option>
							{/each}
						</select>
					</div>
					<div class="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
						<Button
							variant="secondary"
							onclick={() => showSyncModal = false}
							class="bg-gray-200 hover:bg-gray-300 border-none"
						>
							Cancel
						</Button>
						<Button
							onclick={() => {
								updateSyncInterval();
								showSyncModal = false;
							}}
							disabled={updatingInterval || selectedInterval === project?.interval?.tag}
						>
							{#if updatingInterval}
								<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							{/if}
							Update
						</Button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Edit Project Name Modal -->
	{#if showNameModal}
		<!-- Backdrop -->
		<div
			class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
			onclick={closeNameModal}
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
				aria-labelledby="name-modal-title"
			>
				<!-- Header -->
				<div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
					<h2 id="name-modal-title" class="text-lg font-semibold text-gray-900">Edit Project</h2>
					<Button
						variant="ghost"
						onclick={closeNameModal}
						class="rounded-lg p-2"
						aria-label="Close"
					>
						<X class="h-5 w-5" />
					</Button>
				</div>

				<!-- Content -->
				<form onsubmit={(e) => { e.preventDefault(); updateProjectName(); }} class="px-6 py-6">
					<div class="space-y-4">
            <div>
							<label for="edit-project-name" class="block text-sm font-medium text-gray-700 mb-2">
								Project Name
							</label>
							<Input
								type="text"
								id="edit-project-name"
								name="project-name"
								placeholder="Enter project name"
								bind:value={projectName}
								required
								disabled={updatingProject}
								maxlength={100}
								class="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500/20 disabled:bg-gray-50 transition-colors"
							/>
							<p class="mt-2 text-xs text-gray-500">{projectName.length}/100 characters</p>
						</div>
						<div>
							<label for="edit-project-name" class="block text-sm font-medium text-gray-700 mb-2">
								Chat ID
							</label>
							<Input
								type="text"
								id="edit-chat-id"
								name="chat-id"
								placeholder="Enter Chat ID"
								bind:value={chatId}
								required
								disabled={updatingProject}
								maxlength={100}
								class="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500/20 disabled:bg-gray-50 transition-colors"
							/>
							<p class="mt-2 text-xs text-gray-500">{projectName.length}/100 characters</p>
						</div>
					</div>

					<!-- Actions -->
					<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2">
						<Button
							type="button"
							variant="secondary"
							onclick={closeNameModal}
							disabled={updatingProject}
							class="w-full sm:w-auto px-4 py-3"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={updatingProject}
							class="w-full sm:w-auto px-4 py-3"
						>
							{#if updatingProject}
								<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								<span>Updating...</span>
							{:else}
								<span>Update </span>
							{/if}
						</Button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>
