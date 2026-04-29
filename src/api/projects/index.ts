import { factory } from "@/db";
import { populateAuth } from "@/middlware";
import { HonoApp } from "@/types";
import { getUserFromSession, sendError } from "@/utils";
import { projectCreationSchema, projectUpdationSchema } from "@/utils/validation";
import { Hono } from "hono";

const router = new Hono<HonoApp>();
router.use('*', populateAuth)

router.get('/my', async (c) => {
  const user = getUserFromSession(c)

  const projects = await factory.project.getByOwnerId(user.id)
  return c.json(projects, 200)
})

router.get('/:id', async (c) => {
  const user = getUserFromSession(c)
  const project = await factory.project.getOneDetailed(c.req.param('id'))
  if (!project)
    sendError('Project not found', 404)

  if (project.ownerId !== user.id)
    sendError("Project doesnot belong to you", 403)

  return c.json(project, 200)
})

router.post('/', async (c) => {
  const user = getUserFromSession(c)
  const body = projectCreationSchema.parse(await c.req.json())

  const project = await factory.project.create({
    ownerId: user.id,
    name: body.name,
  })

  return c.json({ id: project.id }, 200)
})

router.put('/:id', async (c) => {
  const user = getUserFromSession(c)
  const body = projectUpdationSchema.parse(await c.req.json())

  const project = await factory.project.getOne(c.req.param('id'))
  if (!project)
    sendError("Project not found", 404)

  if (project.ownerId !== user.id)
    sendError("Project doesnot belong to you", 403)

  await factory.project.update(project.id, {
    name: body.name || undefined,
  })

  return c.json({ }, 200)
})

export default router;
