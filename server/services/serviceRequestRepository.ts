import type { ServiceRequestInput, ServiceRequestRecord } from '~/shared/service-request'

export type ServiceRequestRepository = {
  create: (input: ServiceRequestInput) => Promise<ServiceRequestRecord>
  list: () => Promise<ServiceRequestRecord[]>
  getById: (id: string) => Promise<ServiceRequestRecord | null>
}

function getStore(): ServiceRequestRecord[] {
  const key = '__promo_service_requests__'
  const g = globalThis as unknown as Record<string, unknown>

  if (!Array.isArray(g[key])) {
    g[key] = []
  }

  return g[key] as ServiceRequestRecord[]
}

export function getServiceRequestRepository(): ServiceRequestRepository {
  return {
    async create(input) {
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const record: ServiceRequestRecord = {
        ...input,
        id,
        createdAt: new Date().toISOString(),
        status: 'new'
      }

      // TODO(db): заменить на запись в БД (например Prisma/SQLite/Postgres).
      // Интерфейс репозитория оставлен специально, чтобы заменить реализацию без изменения API/формы.
      getStore().unshift(record)

      return record
    },

    async list() {
      return getStore()
    },

    async getById(id) {
      return getStore().find(r => r.id === id) ?? null
    }
  }
}
