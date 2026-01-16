import type { H3Event } from 'h3'
import { createError, deleteCookie, getCookie, setCookie } from 'h3'
import { SignJWT, jwtVerify } from 'jose'

const cookieName = 'promo_admin_session'

function getJwtKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export type AdminSession = {
  adminUserId: string
}

export async function setAdminSession(event: H3Event, session: AdminSession) {
  const token = await new SignJWT({ sub: session.adminUserId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtKey())

  setCookie(event, cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
}

export function clearAdminSession(event: H3Event) {
  deleteCookie(event, cookieName, { path: '/' })
}

export async function getAdminSession(event: H3Event): Promise<AdminSession | null> {
  const token = getCookie(event, cookieName)
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getJwtKey(), { algorithms: ['HS256'] })
    const adminUserId = typeof payload.sub === 'string' ? payload.sub : ''
    if (!adminUserId) return null
    return { adminUserId }
  } catch {
    return null
  }
}

export async function requireAdminSession(event: H3Event): Promise<AdminSession> {
  const session = await getAdminSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  return session
}

