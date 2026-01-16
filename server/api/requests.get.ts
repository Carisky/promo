import { getServiceRequestRepository } from '../services/serviceRequestRepository'
import { createError } from 'h3'

export default defineEventHandler(async () => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const repo = getServiceRequestRepository()
  const requests = await repo.list()

  return { ok: true, requests }
})
