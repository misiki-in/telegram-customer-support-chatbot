import { sendError } from "./api-error"

export async function GET(url: string) {
  const response = await fetch(url)
  if (!response.ok)
    sendError(`GET ${url} failed`, 500)

  return response.json()
}
