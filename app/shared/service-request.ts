export type ServiceRequestUrgency = 'low' | 'normal' | 'high'

export type ServiceRequestPreferredContact = 'telegram' | 'phone' | 'any'

export type ServiceRequestInput = {
  name?: string
  model: string
  serviceSlug?: string
  issue: string
  email?: string
  phone?: string
  telegram?: string
  contact: string
  preferredContact?: ServiceRequestPreferredContact
  urgency?: ServiceRequestUrgency
  comment?: string
}

export type ServiceRequestRecord = ServiceRequestInput & {
  id: string
  createdAt: string
  status: 'new'
}

