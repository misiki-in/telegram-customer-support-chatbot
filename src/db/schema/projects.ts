import { relations, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import {
  boolean,
	index,
	pgTable,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';
import { id, timestamps, varcharId } from '../helpers';
import { Bot, User } from '.';

export const Project = pgTable(
	'projects',
	{
		id: id('pr'),
    ownerId: varcharId('owner_id')
      .notNull()
      .references(() => User.id),
    isActive: boolean('is_active').notNull().default(true),
    name: varchar('name').notNull(),
    botId: varcharId('bot_id')
      .references(() => Bot.id),
    chatId: varchar('chat_id').notNull(),
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
  bot: one(Bot, {
    fields: [Project.botId],
    references: [Bot.id]
  })
}));

export type Project = InferSelectModel<typeof Project>;
export type CreateProject = InferInsertModel<typeof Project>;
export type UpdateProject = Partial<Omit<CreateProject, 'id'>>;
