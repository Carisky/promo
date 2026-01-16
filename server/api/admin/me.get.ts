import { getPrisma } from '../../utils/prisma'
import { getAdminSession } from '../../utils/adminSession'

export default defineEventHandler(async (event) => {
  const session = await getAdminSession(event)
  if (!session) return { ok: true, user: null }

  const prisma = getPrisma()
  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminUserId },
    select: { id: true, username: true }
  })

  if (!admin) return { ok: true, user: null }
  return { ok: true, user: admin }
})

