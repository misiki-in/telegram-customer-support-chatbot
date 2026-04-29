export async function sendMessage(botToken: string, chatId: string, message: string) {

  console.log("Sending", botToken, message, "to", chatId)
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      })
    })

    const body = await res.json()
    if (!res.ok)
      throw false

    return true
  } catch (e: any) {
    console.error("Telegram API error:", e)
    return false
  }
}

export async function getUpdates(botToken: string, offset: number) {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/getUpdates?offset=${offset}&timeout=5&allowed_updates=["message"]`,
    );

    const body = await res.json()
    if (!res.ok)
      throw body

    return body
  } catch (e: any) {
    console.error("Telegram API error:", e)
    return false
  }

}
