import { getServiceRequestRepository } from '../services/serviceRequestRepository'
import { validateServiceRequestInput } from '../utils/validateServiceRequest'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const input = validateServiceRequestInput(body)

  const repo = getServiceRequestRepository()
  const request = await repo.create(input)

  return { ok: true, request }
})

