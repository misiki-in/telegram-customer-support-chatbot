import { Context } from "hono";
import { sendError } from "./api-error";
import { factory } from "@/db";

export * from "./api-error";
export * from "./fetch";
export * from './session-cookie'
export * from './get-from-session'
export * from './cache'

export function getStoreDomain(c: Context) {
  const domain = c.req.header("x-site-domain");
  if (!domain) sendError("x-site-domain header missing", 400);
  return domain;
}

export async function getProjectFromDomain(domain: string): Promise<string> {
  const projectId = await factory.domain.getProjectId(domain)
  if (!projectId)
    sendError('No associtated project id', 422)
  return projectId
}

export async function getProjectId(c: Context): Promise<string> {
  return getProjectFromDomain(getStoreDomain(c))
}
