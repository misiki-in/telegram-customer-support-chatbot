import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chatMessages } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET({ url }) {
	try {
		const sessionId = url.searchParams.get('sessionId');

		if (!sessionId) {
			return json({ success: false, error: 'Session ID is required' }, { status: 400 });
		}

		const messages = await db.select().from(chatMessages)
			.where(eq(chatMessages.sessionId, sessionId))
			.orderBy(asc(chatMessages.timestamp));

		return json({ success: true, messages });
	} catch (error) {
		console.error('Error fetching chat history:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
