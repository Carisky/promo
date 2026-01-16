export type ServiceRequestInput = {
  name?: string
  model: string
  serviceSlug?: string
  issue: string
  comment?: string
  email?: string
  phone?: string
  telegram?: string
  contact: string
  preferredContact?: 'telegram' | 'phone' | 'any'
  urgency?: 'low' | 'normal' | 'high'
}

export type ServiceRequestStatus = 'new' | 'in_progress' | 'done' | 'canceled'

export type ServiceRequestRecord = ServiceRequestInput & {
  id: string
  createdAt: string
  status: ServiceRequestStatus
}

