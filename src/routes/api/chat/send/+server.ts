import { json } from '@sveltejs/kit';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '$env/static/private';
import { db } from '$lib/server/db';
import { chatMessages, chatSessions } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST({ request, getClientAddress }) {
	try {
		const { text, isSystem, sessionId, metadata } = await request.json();
		const ip = getClientAddress();

		if (!text) {
			return json({ success: false, error: 'Text is required' }, { status: 400 });
		}

		// Update or create session metadata
		if (sessionId) {
			const existingSession = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId)).limit(1);

			if (existingSession.length === 0) {
				await db.insert(chatSessions).values({
					sessionId,
					ipAddress: ip,
					country: metadata?.country,
					city: metadata?.city,
					browserInfo: { ua: metadata?.ua, screen: metadata?.screen, language: metadata?.language },
					marketingData: { referrer: metadata?.referrer },
					updatedAt: new Date()
				});
			} else {
				await db.update(chatSessions).set({
					updatedAt: new Date()
				}).where(eq(chatSessions.sessionId, sessionId));
			}

			// Log message to DB
			await db.insert(chatMessages).values({
				sessionId,
				sender: isSystem ? 'system' : 'user',
				text
			});
		}

		if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
			console.log('TELEGRAM MOCK SEND:', text, 'SESSION:', sessionId);
			return json({ success: true, simulated: true });
		}

		let visitorInfo = '';
		if (metadata) {
			const loc = [metadata.city, metadata.country].filter(Boolean).join(', ');
			visitorInfo = `\n📍 Location: ${loc || 'Unknown'}\n🔗 URL: ${metadata.url || 'Unknown'}\n⏰ Timezone: ${metadata.timezone || 'Unknown'}\n💻 OS/Browser: ${metadata.ua || 'Unknown'}`;
		}

		const prefix = isSystem
			? `🤖 <b>SYSTEM ALERT</b>\nSession: <code>${sessionId || 'No Session'}</code>`
			: `🧑 <b>User Message</b>\nIP: <code>${ip}</code>\nSession: <code>${sessionId || 'No Session'}</code>`;

		const messagePayload = `${prefix}${visitorInfo ? `\n\n<b>Visitor Context:</b>${visitorInfo}` : ''}\n\n<b>Message:</b>\n${text}`;

		const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: TELEGRAM_CHAT_ID,
				text: messagePayload,
				parse_mode: 'HTML'
			})
		});

		const data = await response.json();

		if (!response.ok) {
			console.error('Telegram API error:', data);
			return json({ success: false, error: 'Failed to send message to Telegram' }, { status: 500 });
		}

		const tgMessageId = data.result.message_id;
		if (sessionId && tgMessageId) {
			// Find the last message we just inserted and update its tgMessageId
			const lastMsgs = await db.select().from(chatMessages)
				.where(eq(chatMessages.sessionId, sessionId))
				.orderBy(desc(chatMessages.timestamp))
				.limit(1);

			if (lastMsgs.length > 0) {
				await db.update(chatMessages)
					.set({ tgMessageId: tgMessageId.toString() })
					.where(eq(chatMessages.id, lastMsgs[0].id));
			}
		}

		return json({ success: true, messageId: tgMessageId });
	} catch (error) {
		console.error('Error sending message:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
