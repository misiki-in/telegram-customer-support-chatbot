import { eq } from "drizzle-orm";
import { db } from "..";
import { UpdateUser, User, type CreateUser } from "@/db/schema";

export async function create(inputs: CreateUser) {
  const [row] = await db
    .insert(User)
    .values(inputs)
    .returning({
      id: User.id
    })

  return row
}

export async function update(id: string, inputs: UpdateUser) {
  await db
    .update(User)
    .set({
      ...inputs,
      updatedAt: new Date()
    })
    .where(eq(User.id, id))
}

export async function getOne(id: string) {
  return await db.query.User.findFirst({
    where: eq(User.id, id)
  })
}

export async function getOneByEmail(email: string) {
  return await db.query.User.findFirst({
    where: eq(User.email, email)
  })
}

export async function list() {
  return db.query.User.findMany()
}
