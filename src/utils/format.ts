import { sendSchema } from '@/utils/validation'
import { z } from 'zod';

type MessageBody = z.infer<typeof sendSchema>

export function formatMessage(body: MessageBody, sessionId: string) {
  let visitorInfo = '';
  if (body.metadata) {
    const loc = [body.metadata.city, body.metadata.country].filter(Boolean).join(', ');
    visitorInfo = `
📍 Location: ${loc || 'Unknown'}
🔗 URL: ${body.metadata.url || 'Unknown'}
↩️ Referrer: ${body.metadata.referrer || 'Unknown'}
⏰ Timezone: ${body.metadata.timezone || 'Unknown'}
💻 OS/Browser: ${body.metadata.ua || 'Unknown'}`;
  }

  const prefix = body.isSystem
    ? `🤖 <b>SYSTEM ALERT</b>\nSession: <code>${sessionId || 'No Session'}</code>`
    : `🧑 <b>User Message</b>\nIP: <code>${body.ip}</code>\nSession: <code>${sessionId || 'No Session'}</code>`;

  return `${prefix}${visitorInfo ? `\n\n<b>Visitor Context:</b>${visitorInfo}` : ''}\n\n<b>Message:</b>\n${body.message}`;
}
