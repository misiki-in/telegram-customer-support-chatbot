import { eq } from "drizzle-orm";
import { db } from "..";
import { CreateProject, Project, UpdateProject } from "../schema";
import { projectCache } from "@/utils";

export type ProjectRecord = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    isActive: boolean;
    botId: string | null;
    chatId: string;
    botToken: string | null;
    lastSyncedAt: Date;
    bot: {
        token: string;
    } | null;
}

export async function create(inputs: CreateProject) {
  const [row] = await db
    .insert(Project)
    .values(inputs)
    .returning()

  projectCache.set(row.id, row)
  return row
}

export async function update(id: string, inputs: UpdateProject) {
  const [row] = await db
    .update(Project)
    .set({
      ...inputs,
      updatedAt: new Date(),
    })
    .where(eq(Project.id, id))
    .returning()

  projectCache.set(row.id, row)
}

export async function getByOwnerId(ownerId: string) {
  return db.query.Project.findMany({
    where: eq(Project.ownerId, ownerId)
  })
}

export async function getOne(id: string) {
  const cache = projectCache.get<ProjectRecord>(id)
  if (cache) return cache

  const row = await db.query.Project.findFirst({
    where: eq(Project.id, id),
    with: {
      bot: {
        columns: {
          token: true
        }
      }
    }
  })

  if (!row) return null
  projectCache.set(row.id, row)
  return row
}

export async function getOneDetailed(id: string) {
  return db.query.Project.findFirst({
    where: eq(Project.id, id),
    with: {
      bot: true,
    }
  })
}

export async function list() {
  return db.query.Project.findMany({
    columns: {
      createdAt: false,
      updatedAt: false,
    },
  })
}
