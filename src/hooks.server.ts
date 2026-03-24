import { setupTelegramWebhook } from '$lib/server/chatbot-cache';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

// Setup Telegram Webhook for real-time chatbot replies
const domain = (env as any).PUBLIC_DOMAIN?.replace('https://', '').replace('http://', '');
if (domain && !domain.includes('localhost')) {
	setupTelegramWebhook(domain);
}

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
