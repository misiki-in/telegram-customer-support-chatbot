import { pgTable, text, timestamp, jsonb, uuid, serial } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	description: text('description'),
	entities: jsonb('entities').notNull(), // Array of Entity objects
	config: jsonb('config').notNull(),     // StackConfig object
	stackblitzId: text('stackblitz_id'),   // Persistent StackBlitz container ID
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const chatSessions = pgTable('chat_sessions', {
	sessionId: text('session_id').primaryKey(),
	email: text('email'),
	ipAddress: text('ip_address'),
	country: text('country'),
	city: text('city'),
	browserInfo: jsonb('browser_info'),
	marketingData: jsonb('marketing_data'),
	businessType: text('business_type'),
	annualRevenue: text('annual_revenue'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const chatMessages = pgTable('chat_messages', {
	id: serial('id').primaryKey(),
	sessionId: text('session_id').references(() => chatSessions.sessionId),
	sender: text('sender').notNull(), // 'user', 'agent', 'system'
	text: text('text').notNull(),
	tgMessageId: text('tg_message_id'), // To map telegram replies back to session
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
