import { eq } from "drizzle-orm";
import { db } from "..";
import { Chat, CreateChat } from "../schema/chats";

export async function create(inputs: CreateChat) {
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
