import { relations, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import {
  boolean,
	index,
	pgTable,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';
import { id, timestamps, varcharId } from '../helpers';
import { User } from '.';

export const Project = pgTable(
	'projects',
	{
		id: id('pr'),
    ownerId: varcharId('owner_id')
      .notNull()
      .references(() => User.id),
    name: varchar('name').notNull(),
    chatId: varchar('chat_id').notNull(),
    botToken: varchar('bot_token'),
    lastSyncedAt: timestamp('last_synced_at').defaultNow().notNull(),
		...timestamps
	},
	(table) => ({
		projectOwnerId: index('project_owner_id').on(table.ownerId)
	})
);

export const ProjectRelations = relations(Project, ({ one, many }) => ({
  owner: one(User, {
    fields: [Project.ownerId],
    references: [User.id]
  }),
}));

export type Project = InferSelectModel<typeof Project>;
export type CreateProject = InferInsertModel<typeof Project>;
export type UpdateProject = Partial<Omit<CreateProject, 'id'>>;
