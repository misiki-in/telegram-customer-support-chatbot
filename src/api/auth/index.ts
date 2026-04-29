import { Hono } from "hono";
import { factory } from "@/db/factory";
import { sendError } from "@/utils";
import { deleteSessionCookie, setSessionCookie } from "@/utils";
import type { HonoApp } from "@/types";
import { loginSchema, signupSchema } from "@/utils/validation";
import { populateAuth } from "@/middlware";

const router = new Hono<HonoApp>();

router.get("me", populateAuth, async (c) => {
  const user = c.get("user");
  console.log("GET /me - User from context:", user);
  if (!user?.id) return c.json(null, 200);
  const me = await factory.user.getOne(user.id);
  if (!me) return c.json(null, 200);
  return c.json({
    id: me.id,
    name: me.name,
    email: me.email,
    tier: me.tier,
    role: me.role,
  }, 200);
});

router.post("login", async (c) => {
  const body = loginSchema.parse(await c.req.json());

  let user = await factory.user.getOneByEmail(body.email);
  if (!user) sendError("Email not registered", 404);

  const match = await Bun.password.verify(body.password, user.passwordHash);
  if (!match)
    sendError("Invalid password", 401)

  const token = await setSessionCookie(c, {
    role: user.role,
    id: user.id,
  });

  return c.json({ token, success: true })
});

router.post("signup", async (c) => {
  const body = signupSchema.parse(await c.req.json())
  const existingUser = await factory.user.getOneByEmail(body.email)
  if (existingUser)
    sendError('Email already registered', 400)

  const passwordHash = await Bun.password.hash(body.password, 'bcrypt')
  const user = await factory.user.create({
    email: body.email,
    role: 'customer',
    tier: 'free',
    name: body.name,
    passwordHash,
  })

  const token = await setSessionCookie(c, {
    role: 'customer',
    id: user.id,
  });

  return c.json({ id: user.id, token }, 200)
})

router.delete("logout", async (c) => {
  deleteSessionCookie(c);
  return c.body(null, 204);
});

export default router;
