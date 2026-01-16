import bcrypt from 'bcryptjs'
import { createError } from 'h3'
import { getPrisma } from '../../utils/prisma'
import { setAdminSession } from '../../utils/adminSession'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const username = String(body?.username ?? '').trim()
  const password = String(body?.password ?? '')

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing credentials' })
  }
  if (username.length > 80 || password.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid credentials' })
  }

  const prisma = getPrisma()
  const admin = await prisma.adminUser.findUnique({ where: { username } })
  if (!admin) throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })

  const ok = await bcrypt.compare(password, admin.passwordHash)
  if (!ok) throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })

  await setAdminSession(event, { adminUserId: admin.id })
  return { ok: true, user: { id: admin.id, username: admin.username } }
})

