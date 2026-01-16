import { clearAdminSession } from '../../utils/adminSession'

export default defineEventHandler(async (event) => {
  clearAdminSession(event)
  return { ok: true }
})

