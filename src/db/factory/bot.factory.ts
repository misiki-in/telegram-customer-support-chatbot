import { count, eq } from "drizzle-orm";
import { db } from "..";
import { Bot, CreateBot, UpdateBot } from "../schema/bots";
import { Project } from "../schema";

export async function create(inputs: CreateBot) {
  const [row] = await db
    .insert(Bot)
    .values(inputs)
    .returning({
      id: Bot.id
    })

  return row
}

export async function update(id: string, inputs: UpdateBot) {
  await db
    .update(Bot)
    .set({
      ...inputs,
      updatedAt: new Date(),
    })
    .where(eq(Bot.id, id))
}

export async function getOneByToken(token: string) {
  return db.query.Bot.findFirst({
    where: eq(Bot.token, token),
    columns: {
      id: true
    }
  })
}

export async function remove(id: string) {
  await db
    .delete(Bot)
    .where(eq(Bot.id, id))
}

export async function getProjectCount(id: string) {
  const [row] = await db
    .select({
      count: count()
    })
    .from(Project)
    .where(eq(Project.botId, id))

  return row.count
}

export async function list() {
  return await db.query.Bot.findMany({
    where: eq(Bot.isActive, true),
    columns: {
      id: true,
      token: true,
      lastSeenUpdateId: true,
    }
  })
}
