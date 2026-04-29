import { IS_DEV } from '@/env';
import { Context, ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';

export class ApiError extends Error {
	status: ContentfulStatusCode;
	constructor(message: string, status: ContentfulStatusCode) {
		super(message);
		this.message = message;
		this.status = status;
	}
}

export function sendError(message: string, status: ContentfulStatusCode): never {
	throw new ApiError(message, status);
}

export const handleError: ErrorHandler = (err: Error, c: Context) => {
  console.log("=== ERROR", c.req.method, c.req.url ,"===")
  if (IS_DEV) console.error(err)
  console.error(err)
  console.log("=== END ===")
  if (err instanceof ApiError)
    return c.json({ message: err.message }, err.status)

  if (err instanceof ZodError)
    return c.json({ message: 'Request schema invalid' }, 400)

  return c.json({ message: 'Operation failed' }, 500)
}
