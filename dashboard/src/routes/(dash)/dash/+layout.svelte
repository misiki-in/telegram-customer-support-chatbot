<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';

  const { children } = $props()
</script>

<Nav />
{@render children()}
