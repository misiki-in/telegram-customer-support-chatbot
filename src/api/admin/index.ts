import { HonoApp } from "@/types";
import { clearAllCache } from "@/utils";
import { Hono } from "hono";

const router = new Hono<HonoApp>()

router.get('reset-cache', async (c) => {
  clearAllCache()
  return c.json({ message: "Done" })
})

export default router
