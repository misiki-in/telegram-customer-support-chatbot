import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'


class TelegramSupportBot {
  CONTAINER_ID = "telegram-support-bot"
  private apiKey: string
  private endpoint: string

  constructor(endpoint: string, apiKey: string, container: HTMLElement) {
    this.apiKey = apiKey
    this.endpoint = endpoint

    try {
      const app = mount(App, {
        target: container,
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

const container = document.getElementById('container')
const bot = new TelegramSupportBot("http://localhost:7000", "xxx", container)
