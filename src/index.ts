import api from "@/api"
import env from "@/env"
import { serve } from "bun"

const server = serve({
  port: env.PORT,
  fetch: api.fetch,
})

console.info("Server listening on", env.PORT)
