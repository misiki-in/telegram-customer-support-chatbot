<footer class="relative mt-auto w-full overflow-hidden bg-on-surface dark:bg-on-surface/90 pt-24 pb-12 text-white transition-colors">
	<!-- Decorative Background Element -->
	<div
		class="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[120px]"
	></div>

	<div class="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 md:grid-cols-12">
		<div class="md:col-span-4">
			<div class="mb-8 flex items-center gap-3">
				<!-- <div class="rounded-xl bg-white/10 p-2 backdrop-blur-md">
					<img
						src="/logo-landscape.png"
						alt="Telegram Chatbot Logo"
						class="h-6 w-auto object-contain brightness-0 invert"
					/>
				</div> -->
				<span class="font-headline text-2xl font-black tracking-tighter text-white">Telegram Chatbot</span>
			</div>
			<p class="mb-10 max-w-sm font-body text-base leading-relaxed text-white/60">
				Build and manage powerful customer support chatbots for Telegram. Scale your support with automation and seamless human handoff.
			</p>
		</div>

		<div class="grid grid-cols-2 gap-12 md:col-span-8 lg:grid-cols-3">
			<div>
				<h4 class="mb-8 font-headline text-lg font-bold text-white">Product</h4>
				<ul class="space-y-4">
					{#each ['Features', 'Pricing'] as item}
						<li>
							<a
								class="footer-link inline-block text-white/50 transition-all hover:text-white"
								href="/{item.toLowerCase()}">{item}</a
							>
						</li>
					{/each}
				</ul>
			</div>
			<div>
				<h4 class="mb-8 font-headline text-lg font-bold text-white">Resources</h4>
				<ul class="space-y-4">
					{#each [['Documentation', '/guide'], ['Support Portal', '/support'], ['FAQ', '/faq']] as [name, path]}
						<li>
							<a
								class="footer-link inline-block text-white/50 transition-all hover:text-white"
								href={path}>{name}</a
							>
						</li>
					{/each}
				</ul>
			</div>
			<div>
				<h4 class="mb-8 font-headline text-lg font-bold text-white">Legal</h4>
				<ul class="space-y-4">
					{#each [['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Contact', '/support']] as [name, path]}
						<li>
							<a
								class="footer-link inline-block text-white/50 transition-all hover:text-white"
								href={path}>{name}</a
							>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<div
		class="relative z-10 mx-auto mt-20 flex max-w-7xl flex-col items-center justify-between gap-6 border-t border-white/5 px-6 pt-12 md:flex-row"
	>
		<p class="font-headline text-sm text-white/30">© 2026 Telegram Chatbot. Built for scale.</p>
	</div>
</footer>

<style>
	.font-headline {
		font-family: 'Source Sans 3', sans-serif;
	}
	.footer-link {
		position: relative;
		padding-left: 0;
		transition: all 0.3s ease;
	}
	.footer-link:hover {
		padding-left: 8px;
		color: white !important;
	}
</style>
