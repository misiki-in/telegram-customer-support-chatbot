<script lang="ts">
	import { goto } from '$app/navigation';

	interface Props {
		project: {
			id: string;
			name: string;
			interval?: {
				tag: string;
			};
			lastSyncedAt: string | null;
			isActive: boolean;
		};
	}

	let { project }: Props = $props();

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

	function handleClick() {
		goto(`/dash/projects/${project.id}`);
	}
</script>

<button
	onclick={handleClick}
	class="w-full cursor-pointer text-left p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 {!project
		.isActive
		? 'opacity-60'
		: ''}"
>
	<div class="flex flex-col gap-3">
		<h3 class="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>

		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span class="text-sm text-gray-600">{project.interval?.tag || "None"}</span>
			</div>

			<div class="flex items-center gap-2">
				<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
				<span class="text-sm text-gray-600">Last synced: {formatDate(project.lastSyncedAt)}</span>
			</div>
		</div>

		<div class="mt-2">
			{#if project.isActive}
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
					Active
				</span>
			{:else}
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
					Inactive
				</span>
			{/if}
		</div>
	</div>
</button>
