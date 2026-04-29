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

<main class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6">
	<a
		href="/"
		class="absolute left-4 top-4 z-20 flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary sm:left-6 sm:top-6"
	>
		<ArrowLeft class="h-4 w-4" />
		<span class="hidden xs:inline">Back to Homepage</span>
		<span class="xs:hidden">Home</span>
	</a>
	<!-- Ambient background effects -->
	<div class="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
	<div class="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-secondary-container/20 blur-[120px]"></div>

	<div class="z-10 w-full max-w-[400px]">
		<div class="mb-8 text-center">
			<div class="mx-auto mb-6 flex h-26 w-26 items-center justify-center rounded-2xl bg-white shadow-xl ring-1 ring-outline-variant/10">
				<img src="/logo.png" alt="Aero Search Logo" class="h-20 w-20 object-contain" />
			</div>
			<h1 class="mb-2 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">Aero Search</h1>
			<p class="text-balance font-medium text-on-surface-variant">
				Register to access the dashboard.
			</p>
		</div>

		<AuthToggle />

		<div class="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] sm:p-10">
			<form onsubmit={handleSubmit} class="space-y-5">
				<div class="space-y-2">
					<label for="name" class="block text-sm font-semibold text-on-surface">
						Full Name
					</label>
					<Input
						type="text"
						id="name"
						name="name"
						placeholder="John Doe"
						bind:value={name}
						required
						class="rounded-lg border-none bg-surface-container-low px-4 py-3.5 text-on-surface ring-1 ring-outline-variant/10 transition-all placeholder:text-outline/40 hover:ring-outline-variant/30 focus:bg-surface-container-lowest focus:ring-primary"
					/>
				</div>

				<div class="space-y-2">
					<label for="email" class="block text-sm font-semibold text-on-surface">
						Email Address
					</label>
					<Input
						type="email"
						id="email"
						name="email"
						placeholder="name@company.com"
						bind:value={email}
						required
						class="rounded-lg border-none bg-surface-container-low px-4 py-3.5 text-on-surface ring-1 ring-outline-variant/10 transition-all placeholder:text-outline/40 hover:ring-outline-variant/30 focus:bg-surface-container-lowest focus:ring-primary"
					/>
				</div>

				<div class="space-y-2">
					<label for="password" class="block text-sm font-semibold text-on-surface">
						Password
					</label>
					<Input
						type="password"
						id="password"
						name="password"
						placeholder="••••••••"
						bind:value={password}
						required
						class="rounded-lg border-none bg-surface-container-low px-4 py-3.5 text-on-surface ring-1 ring-outline-variant/10 transition-all placeholder:text-outline/40 hover:ring-outline-variant/30 focus:bg-surface-container-lowest focus:ring-primary"
					/>
				</div>

				<div class="space-y-2">
					<label for="confirmPassword" class="block text-sm font-semibold text-on-surface">
						Confirm Password
					</label>
					<Input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						placeholder="••••••••"
						bind:value={confirmPassword}
						required
						class="rounded-lg border-none bg-surface-container-low px-4 py-3.5 text-on-surface ring-1 ring-outline-variant/10 transition-all placeholder:text-outline/40 hover:ring-outline-variant/30 focus:bg-surface-container-lowest focus:ring-primary"
					/>
				</div>

				<Button
					type="submit"
					disabled={loading}
					class="group relative mt-2 w-full overflow-hidden rounded-2xl bg-primary px-4 py-4 font-bold text-on-primary shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70"
				>
					<div class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
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

