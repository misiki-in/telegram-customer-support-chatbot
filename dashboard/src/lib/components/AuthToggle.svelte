<script lang="ts">
	import { page } from '$app/state';

	const activeClasses = 'bg-black text-white shadow-md';
	const inactiveClasses = 'text-gray-500 hover:bg-gray-100 hover:text-black';
</script>

<div class="mb-8 flex w-full rounded-2xl border border-gray-200 bg-gray-50 p-1.5 shadow-sm">
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
