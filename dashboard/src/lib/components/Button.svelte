<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		class?: string;
	}

	let { 
		children, 
		variant = 'primary', 
		class: className = '', 
		...props 
	}: Props = $props();

	const variantClasses = {
		primary: "bg-primary-600 text-white hover:bg-primary-500 focus:ring-primary-600 shadow-sm",
		secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500 shadow-sm",
		ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-400",
		danger: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-600 shadow-sm"
	};
</script>

<button
	{...props}
	class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 {variantClasses[variant]} {className}"
>
	{@render children()}
</button>
