<script lang="ts">
	import LandingNav from '$lib/components/LandingNav.svelte';
	import LandingFooter from '$lib/components/LandingFooter.svelte';
	import { MessageSquare, Zap, Shield, BarChart3, Users, Globe } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Telegram Chatbot | Modern Customer Support</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-white font-body selection:bg-black selection:text-white">
	<LandingNav />

	<main class="flex-grow pt-20">
		<!-- Hero Section -->
		<section class="relative overflow-hidden px-6 py-24 lg:py-32">
			<!-- Background patterns -->
			<div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
				<div class="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-gray-100 blur-[120px]"></div>
				<div class="absolute bottom-[10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-gray-50 blur-[120px]"></div>
			</div>

			<div class="mx-auto max-w-7xl">
				<div class="text-center">
					<div class="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 shadow-sm mb-8">
						<span class="mr-2 flex h-2 w-2 rounded-full bg-black"></span>
						Now in Beta
					</div>
					<h1 class="font-headline text-5xl font-black tracking-tighter text-black sm:text-7xl lg:text-8xl">
						The Future of <br />
						<span class="text-gray-400">Customer Support.</span>
					</h1>
					<p class="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-gray-500 sm:text-xl">
						Build, manage, and scale your customer support on Telegram. Connect with your users instantly through powerful automated chatbots and human intervention.
					</p>
					<div class="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
						<a
							href="/register"
							class="w-full rounded-2xl bg-black px-8 py-4 text-center font-bold text-white shadow-xl transition-all hover:bg-gray-800 active:scale-[0.98] sm:w-auto"
						>
							Start for free
						</a>
						<a
							href="/login"
							class="w-full rounded-2xl border border-gray-200 bg-white px-8 py-4 text-center font-bold text-gray-900 transition-all hover:bg-gray-50 active:scale-[0.98] sm:w-auto"
						>
							Login to Dashboard
						</a>
					</div>
				</div>

				<!-- App Screenshot Placeholder -->
				<div class="mt-20 relative mx-auto max-w-5xl">
					<div class="rounded-3xl border border-gray-200 bg-white p-2 shadow-2xl overflow-hidden aspect-video group">
						<div class="w-full h-full bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 relative overflow-hidden">
							<div class="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-white/50"></div>
							<div class="relative z-10 flex flex-col items-center">
								<BarChart3 class="w-16 h-16 text-gray-200 mb-4" />
								<div class="w-48 h-2 bg-gray-200 rounded-full mb-2"></div>
								<div class="w-32 h-2 bg-gray-100 rounded-full"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Section -->
		<section class="bg-gray-50 px-6 py-24 lg:py-32" id="features">
			<div class="mx-auto max-w-7xl">
				<div class="mb-20 max-w-3xl">
					<h2 class="font-headline text-4xl font-black tracking-tighter text-black sm:text-5xl">
						Built for performance. <br />
						<span class="text-gray-400">Designed for scale.</span>
					</h2>
					<p class="mt-6 text-lg font-medium text-gray-500">
						Everything you need to manage your Telegram support bots in one unified dashboard. Fast, reliable, and secure.
					</p>
				</div>

				<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					{#each [
						{
							icon: MessageSquare,
							title: 'AI Chatbots',
							desc: 'Deploy intelligent bots that handle common queries 24/7 with human-like precision.'
						},
						{
							icon: Zap,
							title: 'Instant Delivery',
							desc: 'Millisecond response times ensuring your customers never have to wait.'
						},
						{
							icon: Shield,
							title: 'Enterprise Security',
							desc: 'Bank-grade encryption for all your messages and customer data.'
						},
						{
							icon: BarChart3,
							title: 'Deep Analytics',
							desc: 'Understand customer behavior with detailed engagement metrics and reports.'
						},
						{
							icon: Users,
							title: 'Team Collaboration',
							desc: 'Manage multiple bots and team members from a single intuitive workspace.'
						},
						{
							icon: Globe,
							title: 'Global Reach',
							desc: 'Scale your support across different regions with multi-language support.'
						}
					] as feature}
						<div class="group rounded-3xl border border-gray-200 bg-white p-8 transition-all hover:border-black hover:shadow-xl">
							<div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-black transition-colors group-hover:bg-black group-hover:text-white">
								<feature.icon class="h-6 w-6" />
							</div>
							<h3 class="font-headline text-xl font-bold text-black">{feature.title}</h3>
							<p class="mt-4 font-medium leading-relaxed text-gray-500">{feature.desc}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- CTA Section -->
		<section class="px-6 py-24 lg:py-32">
			<div class="mx-auto max-w-7xl">
				<div class="relative overflow-hidden rounded-[3rem] bg-black px-8 py-20 text-center sm:px-16">
					<!-- Pattern -->
					<div class="absolute inset-0 -z-10 opacity-20">
						<div class="absolute top-0 left-0 h-full w-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
					</div>
					
					<h2 class="font-headline text-4xl font-black tracking-tighter text-white sm:text-6xl">
						Ready to transform your support?
					</h2>
					<p class="mx-auto mt-8 max-w-xl text-lg font-medium text-gray-400">
						Join hundreds of teams using Telegram Chatbot to deliver exceptional customer experiences.
					</p>
					<div class="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
						<a
							href="/register"
							class="w-full rounded-2xl bg-white px-8 py-4 text-center font-bold text-black shadow-xl transition-all hover:bg-gray-100 active:scale-[0.98] sm:w-auto"
						>
							Create your bot now
						</a>
						<a
							href="/login"
							class="w-full rounded-2xl border border-white/20 bg-transparent px-8 py-4 text-center font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98] sm:w-auto"
						>
							View Pricing
						</a>
					</div>
				</div>
			</div>
		</section>
	</main>

	<LandingFooter />
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
	.font-headline {
		font-family: 'Source Sans 3', sans-serif;
	}
	.font-body {
		font-family: 'Source Sans 3', sans-serif;
	}
</style>
