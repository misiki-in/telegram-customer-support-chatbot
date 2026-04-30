<script>
	import { page } from '$app/state';
	import { ArrowLeft, Home } from 'lucide-svelte';
</script>

<div class="relative min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
	<!-- Ambient background effects -->
	<div class="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-gray-200 blur-[120px]"></div>
	<div class="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-gray-300/50 blur-[120px]"></div>

	<div class="z-10 max-w-md w-full">
		<div class="mb-8">
			<div class="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-black text-white">
				<span class="text-6xl font-black">!</span>
			</div>
			<h1 class="text-7xl font-black text-black mb-2 tracking-tighter">Oops!</h1>
			<h2 class="text-2xl font-bold text-gray-900 mb-4">
				{page.status === 404 ? 'Page not found' : 'Something went wrong'}
			</h2>
			<p class="text-gray-500 font-medium mb-10 leading-relaxed">
				{page.status === 404 
					? "The page you're looking for doesn't exist or has been moved to a new location." 
					: "An unexpected error occurred. Our team has been notified."}
			</p>
		</div>

		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a 
				href="/" 
				class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-bold shadow-lg hover:bg-gray-800 transition-all active:scale-[0.98]"
			>
				<Home class="h-5 w-5" />
				Go to Homepage
			</a>
			<button 
				onclick={() => history.back()}
				class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
			>
				<ArrowLeft class="h-5 w-5" />
				Go Back
			</button>
		</div>

		{#if page.status}
			<div class="mt-12 pt-8 border-t border-outline-variant/10">
				<p class="text-xs font-bold uppercase tracking-widest text-outline/40">Error Code: {page.status}</p>
			</div>
		{/if}
	</div>
</div>
