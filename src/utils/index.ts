import { Context } from "hono";
import { sendError } from "./api-error";

export * from "./api-error";
export * from "./fetch";
export * from './session-cookie'
export * from './get-from-session'
export * from './cache'
export * from "./format"

export function getProjectId(c: Context) {
  const key = c.req.header("x-key");
  if (!key) sendError("x-key header missing", 400);
  return key;
}

export function getSessionId(c: Context) {
  const key = c.req.header("x-session-id");
  if (!key) sendError("x-session-id header missing", 400);
  return key;
}
