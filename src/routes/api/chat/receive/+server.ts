import { json } from '@sveltejs/kit';
import { TELEGRAM_BOT_TOKEN } from '$env/static/private';
import { db } from '$lib/server/db';
import { chatMessages } from '$lib/server/db/schema';
import { messageToSessionCache, sessionReplyQueue } from '$lib/server/chatbot-cache';
import { eq, and } from 'drizzle-orm';

let lastUpdateId = 0;

export async function POST({ request }) {
	try {
		const update = await request.json();

		if (update.message && update.message.reply_to_message) {
			const replyToId = update.message.reply_to_message.message_id.toString();
			const text = update.message.text;

			// Check cache for session mapping
			let targetSessionId = messageToSessionCache.get(replyToId) as string;

			if (!targetSessionId) {
				// Fallback to database lookup
				const msg = await db.select().from(chatMessages).where(eq(chatMessages.tgMessageId, replyToId)).limit(1);
				if (msg.length > 0) {
					targetSessionId = msg[0].sessionId!;
					messageToSessionCache.set(replyToId, targetSessionId);
				}
			}

			if (targetSessionId) {
				const msgObj = { text, timestamp: Date.now(), id: `agent-${Date.now()}` };

				// Save agent reply to DB
				await db.insert(chatMessages).values({
					sessionId: targetSessionId,
					sender: 'agent',
					text
				});

				// Queue it for the chatbot session to pick up
				const queue: any[] = sessionReplyQueue.get(targetSessionId) || [];
				queue.push(msgObj);
				sessionReplyQueue.set(targetSessionId, queue);
			}
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error in Telegram Webhook:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}

export async function GET({ url }) {
	try {
		const sessionId = url.searchParams.get('sessionId');

		if (!sessionId) {
			return json({ success: false, error: 'Session ID is required' }, { status: 400 });
		}

		if (!TELEGRAM_BOT_TOKEN) {
			return json({ success: false, messages: [], simulated: true });
		}

		// 1. Check if we have queued messages for this session
		const queuedMessages: any[] = sessionReplyQueue.get(sessionId) || [];
		if (queuedMessages.length > 0) {
			sessionReplyQueue.set(sessionId, []); // Clear queue after retrieving
			return json({ success: true, messages: queuedMessages });
		}

		// 2. Poll Telegram for NEW updates (fallback if webhooks aren't working/setup)
		const offset = lastUpdateId + 1;
		const response = await fetch(
			`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=5&allowed_updates=["message"]`,
			{ method: 'GET' }
		);

		const data = await response.json();

		if (!response.ok) {
			return json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
		}

		const messagesForThisSession: any[] = [];

		if (data.ok && data.result.length > 0) {
			for (const update of data.result) {
				if (update.update_id >= lastUpdateId) {
					lastUpdateId = update.update_id;
				}

				if (update.message && update.message.reply_to_message) {
					const replyToId = update.message.reply_to_message.message_id.toString();
					let targetSessionId = messageToSessionCache.get(replyToId) as string;

					if (!targetSessionId) {
						const msg = await db.select().from(chatMessages).where(eq(chatMessages.tgMessageId, replyToId)).limit(1);
						if (msg.length > 0) {
							targetSessionId = msg[0].sessionId!;
							messageToSessionCache.set(replyToId, targetSessionId);
						}
					}

					if (targetSessionId === sessionId) {
						const msgObj = {
							text: update.message.text,
							timestamp: update.message.date * 1000,
							id: `agent-${update.update_id}`
						};
						messagesForThisSession.push(msgObj);

						// Also save it to DB if not already there
						await db.insert(chatMessages).values({
							sessionId: targetSessionId,
							sender: 'agent',
							text: update.message.text
						});
					}
				}
			}
		}

		return json({ success: true, messages: messagesForThisSession });
	} catch (error) {
		console.error('Error receiving messages:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
