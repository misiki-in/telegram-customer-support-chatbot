export async function GET(url: string, endpoint: string, apiKey: string, sessionId: string) {
  const fullUrl = new URL(`${endpoint}${url}`)
  const res = await fetch(fullUrl, {
    headers: {
      "x-key": apiKey,
      "x-session-id": sessionId
    }
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function POST(url: string, body: any, endpoint: string, apiKey: string, sessionId: string) {
  const fullUrl = new URL(`${endpoint}${url}`)
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: {
      "x-key": apiKey,
      "x-session-id": sessionId
    },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}
