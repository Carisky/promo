import bcrypt from 'bcryptjs'
import { createError } from 'h3'
import { getPrisma } from '../../utils/prisma'
import { requireAdminSession, setAdminSession } from '../../utils/adminSession'

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event)

  const body = await readBody(event)
  const username = String(body?.username ?? '').trim()
  const password = String(body?.password ?? '')

  if (!username && !password) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
  }
  if (username && (username.length < 3 || username.length > 80)) {
    throw createError({ statusCode: 400, statusMessage: 'Username must be 3-80 chars' })
  }
  if (password && (password.length < 8 || password.length > 200)) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be 8-200 chars' })
  }

  const prisma = getPrisma()
  const updateData: { username?: string; passwordHash?: string } = {}
  if (username) updateData.username = username
  if (password) updateData.passwordHash = await bcrypt.hash(password, 12)

  try {
    const updated = await prisma.adminUser.update({
      where: { id: session.adminUserId },
      data: updateData,
      select: { id: true, username: true }
    })

    await setAdminSession(event, { adminUserId: updated.id })
    return { ok: true, user: updated }
  } catch {
    throw createError({ statusCode: 409, statusMessage: 'Username is already taken' })
  }
})
