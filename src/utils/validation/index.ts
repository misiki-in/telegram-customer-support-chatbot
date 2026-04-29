import { z } from 'zod'

export const syncSchema = z.strictObject({
  domain: z.string().min(1, 'Domain is required')
})

export const loginSchema = z.strictObject({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
})

export const signupSchema = z.strictObject({
  email: z.string().min(1, "Email is required"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(1, "Password is required"),
})

export const projectCreationSchema = z.strictObject({
  name: z.string().min(1, "Name is required"),
  chatId: z.string().min(1, "Chat ID is required"),
})

export const userUpgradeSchema = z.strictObject({
  envatoPurchaseCode: z.string().min(1, "Purchase code is required"),
})

export const projectBotUpdation = z.strictObject({
  botToken: z.string().nonoptional(),
})

export const projectUpdationSchema = z.strictObject({
  name: z.string().min(1, "Name is required").optional(),
  chatId: z.string().min(1, "Chat ID is required").optional(),
})

export const storeUpdateSchema = z.strictObject({
  intervalTag: z.string().min(1, "Interval Tag is required")
})

export const sendSchema = z.strictObject({
  message: z.string().min(1, "Message is required"),
  metadata: z.record(z.string(), z.any()),
  ip: z.string().optional(),
  isSystem: z.boolean().nonoptional(),
})

export const chatEmailSchema = z.strictObject({
  email: z.email().nonoptional(),
})

