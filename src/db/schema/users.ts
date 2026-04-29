import { relations, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import {
	index,
	pgEnum,
	pgTable,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';
import { id, timestamps } from '../helpers';
import { Project } from './projects';

export const UserRole = pgEnum('user_role', [
	'admin',
  'customer'
]);

export const UserTier = pgEnum('user_tier', [
  'free',
  'pro'
])

export const User = pgTable(
	'users',
	{
		id: id('user'),
		role: UserRole('role').notNull(),
    tier: UserTier('tier').notNull(),

    email: varchar('email').notNull().unique(),
    name: varchar('name').notNull(),
    passwordHash: varchar('password_hash').notNull(),
		lastLoginAt: timestamp('last_login_at'),

		...timestamps
	},
	(table) => ({
		userEmailIdx: index('user_email_idx').on(table.email)
	})
);

export const UserRelations = relations(User, ({ one, many }) => ({
  projects: many(Project),
}));

export type User = InferSelectModel<typeof User>;
export type CreateUser = InferInsertModel<typeof User>;
export type UpdateUser = Partial<Omit<CreateUser, 'id'>>;
export type UserRole = (typeof UserRole.enumValues)[number];
