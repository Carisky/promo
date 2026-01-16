import { requireAdminSession } from '../../utils/adminSession'
import { getServiceRequestRepository } from '../../services/serviceRequestRepository'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)
  const repo = getServiceRequestRepository()
  const requests = await repo.list()
  return { ok: true, requests }
})

