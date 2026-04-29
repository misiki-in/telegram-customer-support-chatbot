import { SESSION_COOKIE_NAME } from '@/config';
import { sendError } from '@/utils/api-error';
import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import env, { IS_DEV } from '@/env'

export const populateAuth: MiddlewareHandler = async (c, next) => {
	const jwtToken = getCookie(c, SESSION_COOKIE_NAME) ?? c.req.header('x-token');

  if (IS_DEV) {
	  console.log('populateAuth - Cookie name:', SESSION_COOKIE_NAME);
	  console.log('populateAuth - Token found:', !!jwtToken);
	  console.log('populateAuth - All cookies:', c.req.raw.headers.get('cookie'));
  }

	if (jwtToken) {
		try {
			const decodedToken = await verify(jwtToken, env.JWT_SECRET, 'HS256');
			if (IS_DEV) console.log('populateAuth - Token verified:', decodedToken);
			c.set('user', decodedToken);
		} catch (error) {
			console.error('populateAuth - JWT verification failed:', error);
			c.set('user', null);
		}
	} else {
		if (IS_DEV) console.log('populateAuth - No token found, user is null');
		c.set('user', null);
	}
	await next();
};

export const ensureUser: MiddlewareHandler = async (c, next) => {
	const user = c.get('user');
	if (!user?.role) sendError('Access denied', 401);
	await next();
};
