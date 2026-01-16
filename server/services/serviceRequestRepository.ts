import type { ServiceRequestInput, ServiceRequestRecord, ServiceRequestStatus } from '~/shared/service-request'
import { isServiceRequestStatus } from '~/shared/service-request'
import type { ServiceRequest as ServiceRequestRow } from '@prisma/client'
import { getPrisma } from '../utils/prisma'

export type ServiceRequestRepository = {
  create: (input: ServiceRequestInput) => Promise<ServiceRequestRecord>
  list: () => Promise<ServiceRequestRecord[]>
  getById: (id: string) => Promise<ServiceRequestRecord | null>
  updateStatus: (id: string, status: ServiceRequestStatus) => Promise<ServiceRequestRecord | null>
}

function toRecord(row: ServiceRequestRow): ServiceRequestRecord {
  const status = isServiceRequestStatus(row.status) ? row.status : 'new'
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    status,
    model: row.model,
    issue: row.issue,
    contact: row.contact,
    name: row.name ?? undefined,
    serviceSlug: row.serviceSlug ?? undefined,
    comment: row.comment ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    telegram: row.telegram ?? undefined,
    preferredContact: (row.preferredContact as ServiceRequestInput['preferredContact']) ?? undefined,
    urgency: (row.urgency as ServiceRequestInput['urgency']) ?? undefined
  }
}

export function getServiceRequestRepository(): ServiceRequestRepository {
  return {
    async create(input) {
      const prisma = getPrisma()
      const created = await prisma.serviceRequest.create({
        data: {
          status: 'new',
          name: input.name ?? null,
          model: input.model,
          serviceSlug: input.serviceSlug ?? null,
          issue: input.issue,
          comment: input.comment ?? null,
          email: input.email ?? null,
          phone: input.phone ?? null,
          telegram: input.telegram ?? null,
          contact: input.contact,
          preferredContact: input.preferredContact ?? null,
          urgency: input.urgency ?? null
        }
      })

      return toRecord(created)
    },

    async list() {
      const prisma = getPrisma()
      const rows = await prisma.serviceRequest.findMany({ orderBy: { createdAt: 'desc' } })
      return rows.map(toRecord)
    },

    async getById(id) {
      const prisma = getPrisma()
      const row = await prisma.serviceRequest.findUnique({ where: { id } })
      return row ? toRecord(row) : null
    },

    async updateStatus(id, status) {
      const prisma = getPrisma()
      try {
        const updated = await prisma.serviceRequest.update({
          where: { id },
          data: { status }
        })
        return toRecord(updated)
      } catch {
        return null
      }
    }
  }
}
