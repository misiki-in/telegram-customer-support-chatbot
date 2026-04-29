const ENDPOINT = "http://localhost:7090"
const KEY = "pr_01KQD2XKJHF6B0HNMKWRMQNR59"
const sessionId = getSessionId()

function getSessionId() {
  const SESSION_KEY = "session-id"
  const exising = localStorage.getItem(SESSION_KEY)
  if (exising) return exising

  const uuid = crypto.randomUUID()
  localStorage.setItem(SESSION_KEY, uuid)
  return uuid
}

export async function GET(path: string) {
  const url = new URL(`${ENDPOINT}${path}`)
  const res = await fetch(url, {
    headers: {
      "x-key": KEY,
      "x-session-id": sessionId,
    },
  })

  const resBody = await res.json()
  if (!res.ok)
    throw resBody
  return resBody
}

export async function POST(path: string, body: Record<string, any>) {

  const url = new URL(`${ENDPOINT}${path}`)
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-key": KEY,
      "x-session-id": sessionId,
    },
    body: JSON.stringify(body),
  })

  const resBody = await res.json()
  if (!res.ok)
    throw resBody
  return resBody
}
