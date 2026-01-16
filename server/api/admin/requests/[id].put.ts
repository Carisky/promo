import { createError, getRouterParam } from 'h3'
import { requireAdminSession } from '../../../utils/adminSession'
import { getServiceRequestRepository } from '../../../services/serviceRequestRepository'
import { isServiceRequestStatus } from '~/shared/service-request'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing request id' })

  const body = await readBody(event)
  const status = body?.status
  if (!isServiceRequestStatus(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const repo = getServiceRequestRepository()
  const updated = await repo.updateStatus(id, status)
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Request not found' })

  return { ok: true, request: updated }
})

