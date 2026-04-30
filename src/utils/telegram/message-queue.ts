import { CreateChat } from "@/db/schema"
import { getSessionFromMessage } from "../format"
import { getUpdates } from "./api"
import { factory } from "@/db"
import { delay } from ".."

type Message = {
  text: string
}

class UpdateQueue {
  private map: Record<string, Message[]> = {}

  pushUpdate = (session: string, msg: Message) => {
    const list = this.map[session]
    if (!list) this.map[session] = [msg]
    else list.push(msg)
  }

  popUpdate = (session: string) => {
    const list = this.map[session]
    if (!list) return null
    this.map[session] = []
    return list
  }
}

async function syncMessageQueues() {
  console.log("Running message queues sync")
  try {
    const chats: CreateChat[] = []
    let lastUpdateId = 0

    const bots = await factory.bot.list()
    for (const bot of bots) {
      const updates = await getUpdates(bot.token, bot.lastSeenUpdateId + 1)
      console.log(updates)

      if (!updates.result.length) 
        continue

      for (const update of updates.result) {
        lastUpdateId = Math.max(lastUpdateId, update.update_id)
        const replyTo = update.message.reply_to_message
        if (!replyTo) continue
        if (!replyTo.from.is_bot) continue
        const sessionId = getSessionFromMessage(replyTo.text)
        if (!sessionId) continue

        chats.push({
          projectId: null,
          sessionId,
          isSystem: true,
          message: update.message.text,
          metadata: {},
        })
      }

      if (chats.length) {
        await factory.chat.createMultiple(chats)
      }

      console.log("Received", chats.length, "updates")
      await factory.bot.update(bot.id, {
        lastSeenUpdateId: lastUpdateId,
      })
    }
  } catch (e: any) {
    console.error("Sync message queue", e)
  }
}

export async function runSyncPeriodically() {
  while (true) {
    await syncMessageQueues()
    await delay(5000)
  }
}
