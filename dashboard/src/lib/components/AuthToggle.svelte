<script lang="ts">
	import { page } from '$app/state';

	const activeClasses = 'bg-primary text-on-primary shadow-md';
	const inactiveClasses = 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface';
</script>

<div class="mb-8 flex w-full rounded-2xl border border-outline-variant/10 bg-surface-container-low p-1.5 shadow-sm">
	<a
		href="/login"
		class="flex-1 rounded-xl py-2.5 text-center text-sm font-bold transition-all duration-200 {page.url.pathname === '/login' ? activeClasses : inactiveClasses}"
	>
		Login
	</a>
	<a
		href="/register"
		class="flex-1 rounded-xl py-2.5 text-center text-sm font-bold transition-all duration-200 {page.url.pathname === '/register' ? activeClasses : inactiveClasses}"
	>
		Register
	</a>
</div>
