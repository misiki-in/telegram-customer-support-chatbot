import NodeCache from 'node-cache';
import { TELEGRAM_BOT_TOKEN } from '$env/static/private';

// Shared cache to map telegram message IDs to session IDs
export const messageToSessionCache = new NodeCache({ stdTTL: 86400 }); // 24 hours

// Memory store for replies per session to ensure users get their messages even if they poll late
export const sessionReplyQueue = new NodeCache({ stdTTL: 3600 }); // 1 hour

/**
 * Sets the Telegram webhook to our receive endpoint
 * Should be called on server startup (e.g., in hooks.server.ts)
 */
export async function setupTelegramWebhook(domain: string) {
	if (!TELEGRAM_BOT_TOKEN) return;

	const webhookUrl = `https://${domain}/api/chat/receive`;
	console.log(`Setting Telegram webhook to: ${webhookUrl}`);

	try {
		const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message'] })
		});

		const data = await response.json();
		if (data.ok) {
			console.log('Telegram webhook set successfully');
		} else {
			console.error('Failed to set Telegram webhook:', data);
		}
	} catch (error) {
		console.error('Error setting Telegram webhook:', error);
	}
}
