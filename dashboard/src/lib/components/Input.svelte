<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		value?: any;
		class?: string;
	}

	let { 
		value = $bindable(), 
		class: className = '', 
		...props 
	}: Props = $props();
</script>

<input
	{...props}
	bind:value
	class="w-full transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed {className}"
/>
