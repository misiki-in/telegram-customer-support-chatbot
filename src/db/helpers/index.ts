import { timestamp, varchar } from 'drizzle-orm/pg-core';
import { ulid } from 'ulid';

export function generateEntityId(prefix?: string): string {
	return `${prefix}_${ulid()}`;
}

export const id = (prefix: string) =>
	varchar('id', { length: 64 })
		.primaryKey()
		.$defaultFn(() => generateEntityId(prefix));

export const varcharId = (name: string) => varchar(name, { length: 64 });

export const timestamps = {
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
};
