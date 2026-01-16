import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is not set')

const initialUsername = String(process.env.ADMIN_USERNAME || 'admin').trim()
const initialPassword = String(process.env.ADMIN_PASSWORD || 'admin').trim()

if (!initialUsername) throw new Error('ADMIN_USERNAME is empty')
if (!initialPassword) throw new Error('ADMIN_PASSWORD is empty')

const adapter = new PrismaMariaDb(databaseUrl)
const prisma = new PrismaClient({ adapter })

async function main() {
  const existing = await prisma.adminUser.findFirst({ select: { id: true } })
  if (existing) {
    console.log('AdminUser already exists, skipping seed.')
    return
  }

  const passwordHash = await bcrypt.hash(initialPassword, 12)
  await prisma.adminUser.create({
    data: {
      username: initialUsername,
      passwordHash
    }
  })

  console.log(`Seeded AdminUser: ${initialUsername}`)
}

try {
  await main()
} finally {
  await prisma.$disconnect()
}

