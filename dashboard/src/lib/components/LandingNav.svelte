<nav
	class="fixed top-0 z-50 h-20 w-full border-b border-primary/5 bg-white/70 backdrop-blur-2xl transition-all duration-300"
>
	<div class="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
		<div class="flex items-center gap-3">
			<a href="/" class="group flex items-center gap-3">
				<img src="/logo-landscape.png" alt="AeroSearch Logo" class="h-12 w-auto object-contain" />
				<!-- <span class="text-xl font-headline font-black tracking-tighter text-on-surface">AeroSearch</span> -->
			</a>
		</div>
		<div class="hidden items-center gap-10 md:flex">
			{#each ['Features', 'Pricing', 'Guides', 'Support', 'FAQ'] as link}
				<a
					class="nav-link relative py-1 font-headline text-sm font-bold tracking-tight text-on-surface-variant transition-all hover:text-primary"
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
		<div class="flex items-center gap-4">
			<a
				href="/dash"
				class="btn-primary group relative overflow-hidden rounded-full bg-primary px-7 py-3 font-headline text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(110,17,230,0.5)] transition-all hover:scale-105 active:scale-95"
			>
				<span class="relative z-10">Get Started</span>
				<div
					class="from-primary-dim absolute inset-0 bg-gradient-to-r to-primary opacity-0 transition-opacity duration-500 group-hover:opacity-100"
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
		background: var(--color-primary);
		transition: width 0.3s ease;
	}
	.nav-link:hover::after {
		width: 100%;
	}
</style>
