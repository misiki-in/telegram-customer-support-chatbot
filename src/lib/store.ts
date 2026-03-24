import { writable } from 'svelte/store';

// Chat store for triggering chat from anywhere in the app
export const chatState = writable<{
	isOpen: boolean;
	prefilledMessage: string;
	autoSend: boolean;
}>({
	isOpen: false,
	prefilledMessage: '',
	autoSend: false
});
