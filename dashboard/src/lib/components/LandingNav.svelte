<nav
	class="fixed top-0 z-50 h-20 w-full border-b border-gray-100 bg-white/70 backdrop-blur-2xl transition-all duration-300"
>
	<div class="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
		<!-- <div class="flex items-center gap-3">
			<a href="/" class="group flex items-center gap-3">
				<img src="/logo-landscape.png" alt="Telegram Chatbot Logo" class="h-12 w-auto object-contain" />
				<span class="text-xl font-headline font-black tracking-tighter text-on-surface">Telegram Chatbot</span>
			</a>
		</div> -->
		<div class="hidden items-center gap-10 md:flex">
			{#each ['Features', 'Pricing', 'Guides', 'Support', 'FAQ'] as link}
				<a
					class="nav-link relative py-1 font-headline text-sm font-bold tracking-tight text-on-surface-variant transition-all hover:text-black"
					href={link === 'Guides'
						? '/guide'
						: link === 'Support'
							? '/support'
							: `/${link.toLowerCase()}`}
				>
					{link}
				</a>
			{/each}
		</div>
		<div class="flex items-center gap-6">
			<a
				href="/login"
				class="font-headline text-sm font-bold text-gray-600 transition-colors hover:text-black"
			>
				Login
			</a>
			<a
				href="/register"
				class="btn-primary group relative overflow-hidden rounded-full bg-black px-7 py-3 font-headline text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
			>
				<span class="relative z-10">Get Started</span>
				<div
					class="absolute inset-0 bg-gray-800 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
				></div>
			</a>
		</div>
	</div>
</nav>

<style>
	.font-headline {
		font-family: 'Source Sans 3', sans-serif;
	}
	.nav-link::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: 2px;
		background: black;
		transition: width 0.3s ease;
	}
	.nav-link:hover::after {
		width: 100%;
	}
</style>
