import { and, eq } from "drizzle-orm";
import { db } from "..";
import { Chat, CreateChat } from "../schema/chats";

export async function create(inputs: CreateChat) {
  await db
    .insert(Chat)
    .values(inputs)
}

export async function createMultiple(inputs: CreateChat[]) {
  await db
    .insert(Chat)
    .values(inputs)
}

export async function listBySessionId(sessionId: string) {
  return db.query.Chat.findMany({
    where: eq(Chat.sessionId, sessionId),
    columns: {
      message: true,
      createdAt: true,
      isSystem: true,
    }
  })
}

export async function listUnreceivedAndUpdate(sessiondId: string) {
  const messages = await db.query.Chat.findMany({
    where: and(eq(Chat.sessionId, sessiondId), eq(Chat.isReceived, false), eq(Chat.isSystem, true)),
    columns: {
      message: true,
      createdAt: true,
      isSystem: true,
    }
  })

  if (!messages.length) return messages

  await db
    .update(Chat)
    .set({
      isReceived: true
    })
    .where(eq(Chat.sessionId, sessiondId))

  return messages
}
