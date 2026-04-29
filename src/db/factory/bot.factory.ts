import { eq } from "drizzle-orm";
import { db } from "..";
import { Bot, UpdateBot } from "../schema/bots";

export async function create(inputs: Bot) {
  await db
    .insert(Bot)
    .values(inputs)
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
