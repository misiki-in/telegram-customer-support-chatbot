import { pgTable, varchar, integer } from "drizzle-orm/pg-core";
import { id, timestamps } from "../helpers";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { boolean } from "drizzle-orm/pg-core";

export const Bot = pgTable("bots", {
  id: id('bot'),
  isActive: boolean('is_active').notNull().default(true),
  token: varchar('token')
    .unique()
    .notNull(),
  lastSeenUpdateId: integer().notNull().default(0),
  ...timestamps,
})

export const BotRelations = relations(Bot, ({ one, many }) => ({
}))

export type Bot = InferSelectModel<typeof Bot>;
export type CreateBot = InferInsertModel<typeof Bot>;
export type UpdateBot = Partial<Omit<CreateBot, 'id'>>;
