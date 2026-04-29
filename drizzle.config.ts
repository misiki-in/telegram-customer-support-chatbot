import { defineConfig } from 'drizzle-kit';
import env from './src/env'

const databaseUrl = env.DATABASE_URL;

export default defineConfig({
	schema: './src/db/schema/index.ts',
	dialect: 'postgresql',
	dbCredentials: { url: databaseUrl },
	verbose: true,
	strict: true
});
