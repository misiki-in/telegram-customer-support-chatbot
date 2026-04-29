import { relations, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import {
  index,
  pgTable,
  varchar
} from 'drizzle-orm/pg-core';
import { id, timestamps, varcharId } from '../helpers';
import { Project } from '.';
import { jsonb } from 'drizzle-orm/pg-core';
import { boolean } from 'drizzle-orm/pg-core';

export const Chat = pgTable(
  'chats',
  {
    id: id('pr'),
    projectId: varcharId('project_id')
      .references(() => Project.id),
    sessionId: varchar('session_id').notNull(),
    isReceived: boolean('is_received').notNull().default(false),
    message: varchar('message').notNull(),
    metadata: jsonb('metadata').notNull(),
    isSystem: boolean('is_system').notNull(),
    createdAt: timestamps.createdAt,
  },
  (table) => ({
    chatSessionId: index('chat_session_id').on(table.sessionId)
  })
);

export const ChatRelations = relations(Chat, ({ one, many }) => ({
  project: one(Project, {
    fields: [Chat.projectId],
    references: [Project.id]
  }),
}));

export type Chat = InferSelectModel<typeof Chat>;
export type CreateChat = InferInsertModel<typeof Chat>;
export type UpdateChat = Partial<Omit<CreateChat, 'id'>>;
