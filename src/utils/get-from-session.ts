import { Context } from 'hono';
import { sendError } from './api-error';

export function getUserFromSession(c: Context) {
	const user = c.get('user');
	if (!user?.role) sendError('Access denied', 401);
	return {
		id: user.id,
		role: user.role
	};
}
