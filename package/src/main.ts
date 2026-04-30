import { mount, untrack } from 'svelte'
import './app.css'
import App from './App.svelte'

export class TelegramSupportBot {
  CONTAINER_ID = "telegram-support-bot"
  private apiKey: string
  private endpoint: string

  constructor(endpoint: string, apiKey: string, container: HTMLElement) {
    this.apiKey = apiKey
    this.endpoint = endpoint

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

  ensureContainer = (): HTMLElement => {
    const container = document.getElementById(this.CONTAINER_ID)
    if (container) return container

    const ele = document.createElement('div')
    ele.id = this.CONTAINER_ID
    document.body.appendChild(ele)
    return ele
  }
}
