import type { UserRole } from '@/db/schema';
import type { Context } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import env from '@/env'
import { JWT_EXPIRES_IN, SESSION_COOKIE_NAME } from '@/config';

interface Args {
	id: string;
	role: UserRole;
}

export async function setSessionCookie(c: Context, args: Args) {
	const payload = {
		...args,
		exp: new Date().getTime() + JWT_EXPIRES_IN
	};
	const jwtToken = await sign(payload, env.JWT_SECRET, 'HS256');

	const url = new URL(c.req.url);
	const host = url.host;

	// For localhost, don't set a domain (browser will use current domain)
	// For production domains, use the domain with leading dot
	let domain: string | undefined = undefined;
	if (!host.includes('localhost') && !host.startsWith('127.')) {
		domain = `.${host.split(':')[0]}`; // Remove port for domain
	}

	console.log('Setting cookie:', {
		name: SESSION_COOKIE_NAME,
		host: host,
		domain: domain,
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false
	});

	setCookie(c, SESSION_COOKIE_NAME, jwtToken, {
		path: '/',
		...(domain && { domain }),
		sameSite: 'lax',
		secure: false,
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 30 // 30 days in seconds
	});

  return jwtToken
}

export function deleteSessionCookie(c: Context) {
	const url = new URL(c.req.url);
	const host = url.host;

	// For localhost, don't set a domain (browser will use current domain)
	// For production domains, use the domain with leading dot
	let domain: string | undefined = undefined;
	if (!host.includes('localhost') && !host.startsWith('127.')) {
		domain = `.${host.split(':')[0]}`; // Remove port for domain
	}

	deleteCookie(c, SESSION_COOKIE_NAME, {
		path: '/',
		...(domain && { domain }),
		sameSite: 'lax',
		secure: false,
		httpOnly: true
	});
}

