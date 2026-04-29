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
  await factory.chat.create({
    ...body,
    projectId,
    sessionId,
  })
  await sendMessage(
    project.bot?.token || env.DEFAULT_BOT_TOKEN,
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
    project.bot?.token || env.DEFAULT_BOT_TOKEN,
    project.chatId,
    formatted
  )
  return c.json({ success: true }, 200)
})

router.get('/history', async (c) => {
  const projectId = getProjectId(c)
  const sessionId = getSessionId(c)

  const messages = await factory.chat.listBySessionId(sessionId)
  return c.json(messages, 200)
})

router.get('/receive', async (c) => {
  const sessionId = getSessionId(c)
  const messages = await factory.chat.listUnreceivedAndUpdate(sessionId)
  return c.json(messages, 200)
})	

export default router
