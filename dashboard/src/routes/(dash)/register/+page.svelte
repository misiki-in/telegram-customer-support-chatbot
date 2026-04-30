<script lang="ts">
	import { POST } from '$lib/fetch';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { Loader2, ArrowRight, ArrowLeft } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import AuthToggle from '$lib/components/AuthToggle.svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!name.trim()) {
			toast.error('Name is required');
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			toast.error('Please enter a valid email address');
			return;
		}

		if (!password) {
			toast.error('Password is required');
			return;
		}

		if (password !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}

		loading = true;
		try {
			const res = await POST(fetch, '/api/auth/signup', {
				email,
				password,
				name
			});
      localStorage.setItem('token', res.token)
			toast.success('Registration successful!');
			goto('/dash');
		} catch (e: any) {
			toast.error(e.message || 'Registration failed');
		} finally {
			loading = false;
		}
	}
</script>

<main class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 p-6">
	<a
		href="/"
		class="absolute left-4 top-4 z-20 flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-black sm:left-6 sm:top-6"
	>
		<ArrowLeft class="h-4 w-4" />
		<span class="hidden xs:inline">Back to Homepage</span>
		<span class="xs:hidden">Home</span>
	</a>
	<!-- Ambient background effects -->
	<div class="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-gray-200 blur-[120px]"></div>
	<div class="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-gray-300/50 blur-[120px]"></div>

	<div class="z-10 w-full max-w-[400px]">
		<div class="mb-8 text-center">
			<!-- <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
				<img src="/logo.png" alt="Telegram Chatbot Logo" class="h-16 w-16 object-contain grayscale" />
			</div> -->
			<h1 class="mb-2 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">Telegram Chatbot</h1>
			<p class="text-balance font-medium text-gray-500">
				Register to access the dashboard.
			</p>
		</div>

		<AuthToggle />

		<div class="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl sm:p-10">
			<form onsubmit={handleSubmit} class="space-y-5">
				<div class="space-y-2">
					<label for="name" class="block text-sm font-semibold text-gray-700">
						Full Name
					</label>
					<Input
						type="text"
						id="name"
						name="name"
						placeholder="John Doe"
						bind:value={name}
						required
						class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 text-black transition-all placeholder:text-gray-400 focus:border-black focus:ring-0 focus:bg-white"
					/>
				</div>

				<div class="space-y-2">
					<label for="email" class="block text-sm font-semibold text-gray-700">
						Email Address
					</label>
					<Input
						type="email"
						id="email"
						name="email"
						placeholder="name@company.com"
						bind:value={email}
						required
						class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 text-black transition-all placeholder:text-gray-400 focus:border-black focus:ring-0 focus:bg-white"
					/>
				</div>

				<div class="space-y-2">
					<label for="password" class="block text-sm font-semibold text-gray-700">
						Password
					</label>
					<Input
						type="password"
						id="password"
						name="password"
						placeholder="••••••••"
						bind:value={password}
						required
						class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 text-black transition-all placeholder:text-gray-400 focus:border-black focus:ring-0 focus:bg-white"
					/>
				</div>

				<div class="space-y-2">
					<label for="confirmPassword" class="block text-sm font-semibold text-gray-700">
						Confirm Password
					</label>
					<Input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						placeholder="••••••••"
						bind:value={confirmPassword}
						required
						class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 text-black transition-all placeholder:text-gray-400 focus:border-black focus:ring-0 focus:bg-white"
					/>
				</div>

				<Button
					type="submit"
					disabled={loading}
					class="group relative mt-2 w-full overflow-hidden rounded-2xl bg-black px-4 py-4 font-bold text-white shadow-lg hover:bg-gray-900 active:scale-[0.98] disabled:opacity-70 disabled:bg-gray-400"
				>
					{#if loading}
						<Loader2 class="h-5 w-5 animate-spin" />
						<span>Verifying...</span>
					{:else}
						<span>Register</span>
						<ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
					{/if}
				</Button>
			</form>
		</div>

		<div class="mt-8 flex flex-col items-center gap-4 text-center">
		</div>
	</div>
</main>

