<script lang="ts">
	import LandingFooter from '$lib/components/LandingFooter.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	{@render children()}
	<LandingFooter />
</div>
