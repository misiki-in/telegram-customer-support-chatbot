import { json } from '@sveltejs/kit';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '$env/static/private';
import { db } from '$lib/server/db';
import { chatSessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
	try {
		const { email, sessionId } = await request.json();

		if (!email) {
			return json({ success: false, error: 'Email is required' }, { status: 400 });
		}

		console.log('Lead Email Captured:', email, 'Session:', sessionId);

		if (sessionId) {
			await db.update(chatSessions).set({
				email,
				updatedAt: new Date()
			}).where(eq(chatSessions.sessionId, sessionId));
		}

		if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
			const messagePayload = `🚨 *NEW LEAD CAPTURED* 🚨\n\nUser left their email:\n\n✉️ Email: ${email}\nSession: \`${sessionId}\``;

			await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chat_id: TELEGRAM_CHAT_ID,
					text: messagePayload,
					parse_mode: 'Markdown'
				})
			});
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error handling lead email:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
