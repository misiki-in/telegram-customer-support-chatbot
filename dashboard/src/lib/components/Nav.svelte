<script lang="ts">
	import { PUBLIC_API_ENDPOINT } from '$env/static/public';
	import Button from './Button.svelte';
	import { Menu, X, LogOut, Download, LayoutDashboard, BookOpen, Star } from 'lucide-svelte';
	import { page } from '$app/state';

	const extensionDownloadLink = $derived(PUBLIC_API_ENDPOINT + '/extension');
	let isMobileMenuOpen = $state(false);

  const tier = $derived(page.data.user?.tier)

	function logout() {
		localStorage.removeItem('token');
		window.location.reload();
	}

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	// Close mobile menu on navigation
	$effect(() => {
		// Use page.url to react to route changes
		const _url = page.url;
		isMobileMenuOpen = false;
	});
</script>

<nav class="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo and Desktop Nav -->
			<div class="flex items-center gap-8">
				<a
					href="/"
					class="flex items-center gap-2 text-gray-900 transition-colors hover:text-primary-600"
				>
					<img src="/logo.png" alt="AeroSearch Logo" class="h-12 w-12 object-contain" />
				</a>

				<div class="hidden items-center gap-6 md:flex">
					<a
						href="/dash"
						class="flex items-center gap-2 font-medium text-gray-600 transition-colors hover:text-primary-600 {page.url.pathname.startsWith('/dash') ? 'text-primary-600' : ''}"
					>
						<LayoutDashboard class="h-4 w-4" />
						Projects
					</a>
					<a
						href="/guide"
						class="flex items-center gap-2 font-medium text-gray-600 transition-colors hover:text-primary-600 {page.url.pathname.startsWith('/guide') ? 'text-primary-600' : ''}"
					>
						<BookOpen class="h-4 w-4" />
						Guides
					</a>
				</div>
			</div>

			<!-- Desktop Actions -->
			<div class="hidden items-center gap-3 md:flex">
				{#if tier === 'free'}
					<a
						href="/upgrade"
						class="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-extrabold text-black transition-all hover:bg-yellow-500 hover:scale-105 active:scale-95 shadow-lg shadow-yellow-400/20"
					>
						<Star class="h-4 w-4 fill-black" />
						Upgrade to Pro
					</a>
				{/if}
				<a
					href={extensionDownloadLink}
					download="extension.zip"
					class="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
				>
					<Download class="h-4 w-4" />
					Download Extension
				</a>
				<Button
					variant="ghost"
					onclick={logout}
					class="text-gray-600 hover:bg-red-50 hover:text-red-600"
				>
					<LogOut class="h-4 w-4" />
					Logout
				</Button>
			</div>

			<!-- Mobile menu button -->
			<div class="flex items-center md:hidden">
				<Button
					variant="ghost"
					onclick={toggleMobileMenu}
					class="p-2 text-gray-600 hover:bg-gray-100"
					aria-expanded={isMobileMenuOpen}
				>
					<span class="sr-only">Open main menu</span>
					{#if isMobileMenuOpen}
						<X class="h-6 w-6" />
					{:else}
						<Menu class="h-6 w-6" />
					{/if}
				</Button>
			</div>
		</div>
	</div>

	<!-- Mobile nav menu -->
	{#if isMobileMenuOpen}
		<div class="border-t border-gray-100 bg-white py-4 md:hidden">
			<div class="space-y-2 px-4">
				<a
					href="/dash"
					class="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary-600 {page.url.pathname.startsWith('/dash') ? 'bg-primary-50 text-primary-600' : ''}"
				>
					<LayoutDashboard class="h-5 w-5" />
					Projects
				</a>
				<a
					href="/guide"
					class="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary-600 {page.url.pathname.startsWith('/guide') ? 'bg-primary-50 text-primary-600' : ''}"
				>
					<BookOpen class="h-5 w-5" />
					Guides
				</a>

				{#if tier === 'free'}
					<a
						href="/upgrade"
						class="flex items-center gap-3 rounded-xl bg-yellow-400 px-4 py-3 font-extrabold text-black transition-all hover:bg-yellow-500 active:scale-[0.98]"
					>
						<Star class="h-5 w-5 fill-black" />
						Upgrade to Pro
					</a>
				{/if}
				
				<div class="my-4 border-t border-gray-100 pt-4">
					<a
						href={extensionDownloadLink}
						download="extension.zip"
						class="flex w-full items-center gap-3 rounded-xl bg-primary-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
					>
						<Download class="h-5 w-5" />
						Download Extension
					</a>
				</div>
				
				<button
					onclick={logout}
					class="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-600 transition-colors hover:bg-red-50"
				>
					<LogOut class="h-5 w-5" />
					Logout
				</button>
			</div>
		</div>
	{/if}
</nav>
