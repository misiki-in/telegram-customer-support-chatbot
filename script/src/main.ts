import { mount, untrack } from 'svelte'
import './app.css'
import App from './App.svelte'

export class TelegramSupportBot {
  private static CONTAINER_ID = "telegram-support-bot"
  private apiKey: string
  private endpoint: string

  constructor() {
    this.endpoint = window.TELEGRAM_CHATBOT_ENDPOINT
    this.apiKey = window.TELEGRAM_CHATBOT_KEY

    if (!this.endpoint)
      throw "TELEGRAM_CHATBOT_ENDPOINT not found"
    if (!this.apiKey)
      throw "TELEGRAM_CHATBOT_KEY"

    const container = TelegramSupportBot.ensureContainer()

    try {
      untrack(() => {
        mount(App, {
          target: container,
          props: {
            apiKey: this.apiKey,
            endpoint: this.endpoint
          }
        })
      })
    } catch (e: any) {
      console.error("Mount error", e)
    }
  }

  private static ensureContainer = (): HTMLElement => {
    const container = document.getElementById(this.CONTAINER_ID)
    if (container) return container

    const ele = document.createElement('div')
    ele.id = this.CONTAINER_ID
    document.body.appendChild(ele)
    return ele
  }
}

console.log("hello")
new TelegramSupportBot()
