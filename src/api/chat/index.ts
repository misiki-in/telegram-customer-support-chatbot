import { factory } from "@/db";
import env from "@/env";
import { populateAuth } from "@/middlware";
import { HonoApp } from "@/types";
import { formatChatEmail, formatChatMessage, getProjectId, getSessionId, sendError } from "@/utils";
import { sendMessage } from "@/utils/telegram";
import { chatEmailSchema, sendSchema } from "@/utils/validation";
import { Hono } from "hono";

const router = new Hono<HonoApp>();
router.use("*", populateAuth)

router.post('/send', async (c) => {
  const projectId = getProjectId(c)
  const sessionId = getSessionId(c)
  const body = sendSchema.parse(await c.req.json())
  const project = await factory.project.getOne(projectId)
  if (!project)
    sendError('Project not found', 404)

  const formatted = formatChatMessage(body, sessionId)
  await sendMessage(
    project.botToken || env.DEFAULT_BOT_TOKEN,
    project.chatId,
    formatted
  )
  return c.json({ success: true }, 200)
})

router.post('/email', async (c) => {
  const projectId = getProjectId(c)
  const sessionId = getSessionId(c)
  const body = chatEmailSchema.parse(await c.req.json())

  const project = await factory.project.getOne(projectId)
  if (!project)
    sendError('Project not found', 404)

  const formatted = formatChatEmail(body, sessionId)
  await sendMessage(
    project.botToken || env.DEFAULT_BOT_TOKEN,
    project.chatId,
    formatted
  )
  return c.json({ success: true }, 200)
})

router.post('/receive', async (c) => {
  return c.json({}, 200)
})

export default router
