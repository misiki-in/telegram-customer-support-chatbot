import { json } from '@sveltejs/kit';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '$env/static/private';

export async function POST({ request }) {
	try {
		const { fullName, email, message } = await request.json();

		if (!email || !message) {
			return json({ success: false, error: 'Email and message are required' }, { status: 400 });
		}

		console.log('Contact Form Submission:', { fullName, email, message });

		if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
			// Format the message for Telegram
			const text = `🚀 <b>NEW LEAD CAPTURED</b>\n\n` +
				`👤 <b>Name:</b> ${fullName || '<i>Not provided</i>'}\n` +
				`✉️ <b>Email:</b> <code>${email}</code>\n\n` +
				`💬 <b>Message:</b>\n<blockquote>${message || '<i>No message</i>'}</blockquote>\n\n` +
				`🌐 <b>Source:</b> AI CRUD Pro (CodeNx)`;

			const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					chat_id: TELEGRAM_CHAT_ID,
					text: text,
					parse_mode: 'HTML'
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Telegram API error:', errorData);
			}
		} else {
			console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured');
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error handling contact form:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
