import { createError } from 'h3'
import type { ServiceRequestInput } from '~/shared/service-request'

export function normalizeString(value: unknown) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

export function validateServiceRequestInput(body: any): ServiceRequestInput {
  const name = normalizeString(body?.name)
  const model = normalizeString(body?.model)
  const serviceSlug = normalizeString(body?.serviceSlug)
  const issue = String(body?.issue ?? '').trim()
  const email = normalizeString(body?.email)
  const phone = normalizeString(body?.phone)
  const telegram = normalizeString(body?.telegram)
  const rawContact = normalizeString(body?.contact)
  const preferredContact = normalizeString(body?.preferredContact)
  const urgency = normalizeString(body?.urgency)
  const comment = String(body?.comment ?? '').trim()

  if (!model) {
    throw createError({ statusCode: 400, statusMessage: 'Укажите модель ноутбука' })
  }
  if (model.length > 120) {
    throw createError({ statusCode: 400, statusMessage: 'Слишком длинное поле "Модель"' })
  }
  if (!issue) {
    throw createError({ statusCode: 400, statusMessage: 'Опишите проблему' })
  }
  if (issue.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Слишком длинное описание проблемы' })
  }
  const contactParts = [
    telegram ? `Telegram: ${telegram}` : null,
    phone ? `Телефон: ${phone}` : null,
    email ? `Email: ${email}` : null,
    rawContact ? rawContact : null
  ].filter(Boolean) as string[]

  const contact = contactParts.join(' | ').trim()
  if (!contact) throw createError({ statusCode: 400, statusMessage: 'Укажите контакт для связи' })
  if (contact.length > 240) throw createError({ statusCode: 400, statusMessage: 'Слишком длинное поле "Контакт"' })

  const input: ServiceRequestInput = {
    model,
    issue,
    contact
  }

  if (name) input.name = name.slice(0, 80)
  if (serviceSlug) input.serviceSlug = serviceSlug.slice(0, 80)
  if (comment) input.comment = comment.slice(0, 2000)
  if (email) input.email = email.slice(0, 120)
  if (phone) input.phone = phone.slice(0, 60)
  if (telegram) input.telegram = telegram.slice(0, 80)

  if (preferredContact === 'telegram' || preferredContact === 'phone' || preferredContact === 'any') {
    input.preferredContact = preferredContact
  }

  if (urgency === 'low' || urgency === 'normal' || urgency === 'high') {
    input.urgency = urgency
  }

  return input
}
