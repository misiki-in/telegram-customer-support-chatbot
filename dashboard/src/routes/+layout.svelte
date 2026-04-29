<script lang="ts">
	import './layout.css';
	import { Toaster } from 'svelte-sonner';

  const { children } = $props()
</script>

<svelte:head><link rel="icon" href="/logo.png" /></svelte:head>
<Toaster position="top-center" richColors />

{@render children()}
