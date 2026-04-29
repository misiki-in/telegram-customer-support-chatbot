import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import env, { IS_DEV } from '@/env';

const databaseUrl = env.DATABASE_URL

const client = postgres(databaseUrl)
export const db = drizzle(client, { schema, logger: IS_DEV });
export { factory } from './factory';
