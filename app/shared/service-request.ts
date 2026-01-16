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

export const SERVICE_REQUEST_STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'primary', icon: 'heroicons:sparkles-20-solid' },
  { value: 'discussion', label: 'Discussion', color: 'warning', icon: 'heroicons:chat-bubble-left-right-20-solid' },
  { value: 'accepted_to_work', label: 'Accepted to work', color: 'success', icon: 'heroicons:check-badge-20-solid' },
  { value: 'canceled', label: 'Canceled', color: 'error', icon: 'heroicons:x-circle-20-solid' },
  { value: 'in_work', label: 'In work', color: 'primary', icon: 'heroicons:wrench-screwdriver-20-solid' },
  { value: 'waiting_parts', label: 'In work / waiting for parts', color: 'warning', icon: 'heroicons:clock-20-solid' },
  { value: 'job_done', label: 'Job done', color: 'success', icon: 'heroicons:clipboard-document-check-20-solid' },
  { value: 'not_payed', label: 'Not payed', color: 'warning', icon: 'heroicons:banknotes-20-solid' },
  { value: 'payed', label: 'Payed', color: 'success', icon: 'heroicons:credit-card-20-solid' },
  { value: 'waiting_client', label: 'Waiting for client', color: 'neutral', icon: 'heroicons:user-circle-20-solid' },
  { value: 'in_transit_to_me', label: 'In transit to me', color: 'primary', icon: 'heroicons:truck-20-solid' },
  { value: 'in_transit_to_client', label: 'In transit to client', color: 'primary', icon: 'heroicons:truck-20-solid' },
  { value: 'request_done', label: 'Request done', color: 'success', icon: 'heroicons:check-circle-20-solid' }
] as const

export type ServiceRequestStatusColor = 'primary' | 'neutral' | 'success' | 'warning' | 'error'

export type ServiceRequestStatus = (typeof SERVICE_REQUEST_STATUS_OPTIONS)[number]['value']

export function isServiceRequestStatus(value: unknown): value is ServiceRequestStatus {
  if (typeof value !== 'string') return false
  return SERVICE_REQUEST_STATUS_OPTIONS.some(o => o.value === value)
}

export type ServiceRequestStatusOption = (typeof SERVICE_REQUEST_STATUS_OPTIONS)[number]

const SERVICE_REQUEST_STATUS_META = SERVICE_REQUEST_STATUS_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option
    return acc
  },
  {} as Record<ServiceRequestStatus, ServiceRequestStatusOption>
)

export function getServiceRequestStatusLabel(status: ServiceRequestStatus) {
  return SERVICE_REQUEST_STATUS_META[status]?.label ?? status
}

export function getServiceRequestStatusColor(status: ServiceRequestStatus): ServiceRequestStatusColor {
  return SERVICE_REQUEST_STATUS_META[status]?.color ?? 'neutral'
}

export function getServiceRequestStatusIcon(status: ServiceRequestStatus) {
  return SERVICE_REQUEST_STATUS_META[status]?.icon
}

export type ServiceRequestRecord = ServiceRequestInput & {
  id: string
  createdAt: string
  status: ServiceRequestStatus
}
