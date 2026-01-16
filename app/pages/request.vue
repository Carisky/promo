<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { services } from '~/data/services'
import type { ServiceRequestInput, ServiceRequestRecord } from '~/shared/service-request'

useSeoMeta({
  title: 'Заявка',
  description: 'Быстрая заявка для консультации и расчёта стоимости по ремонту ноутбука.'
})

const config = useRuntimeConfig()
const telegramUrl = computed(() => String(config.public.contactTelegramUrl || ''))
const phone = computed(() => String(config.public.contactPhone || ''))
const telHref = computed(() => (phone.value ? `tel:${phone.value.replace(/[^\d+]/g, '')}` : ''))

const toast = useToast()

const state = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  telegram: '',
  model: '',
  serviceSlug: '',
  issue: '',
  comment: '',
  consent: false
})

const created = ref<ServiceRequestRecord | null>(null)
const showPreview = ref(false)

const serviceItems = computed(() => [
  ...services.map(s => ({ label: s.title, value: s.slug }))
])

const serviceTitle = computed(() => {
  const slug = state.serviceSlug.trim()
  if (!slug) return ''
  return services.find(s => s.slug === slug)?.title || slug
})

const fullName = computed(() => [state.firstName.trim(), state.lastName.trim()].filter(Boolean).join(' '))

const contactLine = computed(() => {
  const parts: string[] = []

  const email = state.email.trim()
  const phone = state.phone.trim()
  const telegram = state.telegram.trim()

  if (telegram) parts.push(`Telegram: ${telegram}`)
  if (phone) parts.push(`Телефон: ${phone}`)
  if (email) parts.push(`Email: ${email}`)

  return parts.join(' | ')
})

const summary = computed(() => {
  const lines = [
    created.value?.id ? `Заявка: ${created.value.id}` : null,
    fullName.value ? `Имя: ${fullName.value}` : null,
    state.model.trim() ? `Модель: ${state.model.trim()}` : null,
    serviceTitle.value ? `Тема: ${serviceTitle.value}` : null,
    contactLine.value ? `Контакты: ${contactLine.value}` : null,
    state.issue.trim() ? `Сообщение:\n${state.issue.trim()}` : null,
    state.comment.trim() ? `Комментарий:\n${state.comment.trim()}` : null
  ].filter(Boolean)

  return lines.join('\n\n')
})

const telegramShareUrl = computed(() => {
  const text = summary.value.trim()
  if (!text) return ''
  return `https://t.me/share/url?text=${encodeURIComponent(text)}`
})

function validate(s: typeof state): FormError[] {
  const errors: FormError[] = []

  if (!s.model.trim()) errors.push({ name: 'model', message: 'Укажите модель ноутбука' })
  if (!s.issue.trim()) errors.push({ name: 'issue', message: 'Напишите сообщение' })

  const hasContact = Boolean(s.phone.trim() || s.telegram.trim() || s.email.trim())
  if (!hasContact) errors.push({ name: 'phone', message: 'Укажите телефон, Telegram или email' })

  if (s.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())) {
    errors.push({ name: 'email', message: 'Проверьте email' })
  }

  if (!s.consent) errors.push({ name: 'consent', message: 'Поставьте галочку согласия' })

  return errors
}

async function copySummary() {
  const text = summary.value.trim()
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: 'Скопировано', description: 'Текст заявки в буфере обмена.', color: 'primary' })
  } catch {
    toast.add({ title: 'Не получилось скопировать', description: 'Скопируйте текст вручную.', color: 'warning' })
  }
}

async function onSubmit(_event: FormSubmitEvent<any>) {
  created.value = null

  const contact = contactLine.value.trim()
  if (!contact) return

  const payload: ServiceRequestInput = {
    name: fullName.value || undefined,
    model: state.model.trim(),
    serviceSlug: state.serviceSlug.trim() || undefined,
    issue: state.issue.trim(),
    email: state.email.trim() || undefined,
    phone: state.phone.trim() || undefined,
    telegram: state.telegram.trim() || undefined,
    contact,
    comment: state.comment.trim() || undefined
  }

  try {
    const res = await $fetch<{ ok: true; request: ServiceRequestRecord }>('/api/requests', {
      method: 'POST',
      body: payload
    })

    created.value = res.request
    showPreview.value = true

    toast.add({
      title: 'Заявка создана',
      description: 'Скопируйте текст и отправьте мне в Telegram — я отвечу и назову стоимость.',
      color: 'primary'
    })
  } catch (err: any) {
    const message = err?.data?.statusMessage || err?.statusMessage || 'Не удалось создать заявку'
    toast.add({ title: 'Ошибка', description: String(message), color: 'error' })
  }
}
</script>

<template>
  <UContainer class="py-10">
    <UCard class="overflow-hidden rounded-3xl border border-gray-200/60 bg-white shadow-xl dark:border-gray-800/60 dark:bg-gray-950">
      <div class="grid lg:grid-cols-2">
        <div class="space-y-8 bg-gray-50 p-8 lg:p-12 dark:bg-gray-900/40">
          <div class="space-y-4">
            <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
              Есть вопрос?
            </h1>
            <div class="space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              <p>
                Напишите модель и симптомы — отвечу, уточню детали и скажу ориентир по стоимости.
              </p>
              <p>
                Обычно отвечаю в течение дня. Если срочно — лучше звонок.
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <UButton
              v-if="telegramUrl"
              :to="telegramUrl"
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              color="neutral"
              icon="simple-icons:telegram"
              class="w-full justify-start"
              label="Написать в Telegram"
            />
            <UButton
              v-if="telHref"
              :to="telHref"
              variant="ghost"
              color="neutral"
              icon="heroicons:phone-20-solid"
              class="w-full justify-start"
              :label="phone || 'Позвонить'"
            />
          </div>
        </div>

        <div class="p-8 lg:p-12">
          <UForm :state="state" :validate="validate" :validate-on="['blur', 'change']" @submit="onSubmit">
            <div class="grid gap-4">
              <UFormField label="Имя" name="firstName">
                <UInput v-model="state.firstName" size="lg" class="w-full" placeholder="Имя" autocomplete="given-name" />
              </UFormField>

              <UFormField label="Фамилия" name="lastName">
                <UInput v-model="state.lastName" size="lg" class="w-full" placeholder="Фамилия (необязательно)" autocomplete="family-name" />
              </UFormField>

              <UFormField label="Email" name="email">
                <UInput v-model="state.email" size="lg" type="email" class="w-full" placeholder="Email (необязательно)" autocomplete="email" />
              </UFormField>

              <UFormField label="Телефон" name="phone">
                <UInput v-model="state.phone" size="lg" class="w-full" placeholder="Телефон (необязательно)" autocomplete="tel" />
              </UFormField>

              <UFormField label="Telegram" name="telegram">
                <UInput v-model="state.telegram" size="lg" class="w-full" placeholder="Telegram @username (необязательно)" autocomplete="off" />
              </UFormField>

              <UFormField label="Модель" name="model" required>
                <UInput v-model="state.model" size="lg" class="w-full" placeholder="*Модель ноутбука" />
              </UFormField>

              <UFormField label="Тема" name="serviceSlug">
                <USelect v-model="state.serviceSlug" :items="serviceItems" value-key="value" label-key="label" placeholder="Выберите тему (необязательно)" size="lg" class="w-full" />
              </UFormField>

              <UFormField label="Сообщение" name="issue" required>
                <UTextarea v-model="state.issue" :rows="7" class="w-full" placeholder="*Опишите проблему" />
              </UFormField>

              <UFormField label="Комментарий" name="comment">
                <UTextarea v-model="state.comment" :rows="3" class="w-full" placeholder="Комментарий (необязательно)" />
              </UFormField>

              <UFormField name="consent">
                <UCheckbox v-model="state.consent" label="Согласен(а) на обработку заявки и обратную связь" />
              </UFormField>

              <UButton
                type="submit"
                block
                size="lg"
                class="h-12 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                label="ОТПРАВИТЬ"
              />

              <div class="flex flex-wrap gap-2">
                <UButton variant="soft" color="neutral" icon="heroicons:clipboard-20-solid" :disabled="!summary" label="Копировать текст" @click="copySummary" />
                <UButton v-if="telegramShareUrl" :to="telegramShareUrl" target="_blank" rel="noreferrer" variant="soft" color="primary" icon="simple-icons:telegram" label="Поделиться в Telegram" />
                <UButton variant="ghost" color="neutral" :label="showPreview ? 'Скрыть текст' : 'Показать текст'" @click="showPreview = !showPreview" />
              </div>

              <UCollapsible v-model:open="showPreview" class="pt-2">
                <template #content>
                  <div class="space-y-3">
                    <UAlert
                      v-if="created"
                      color="primary"
                      variant="soft"
                      title="Заявка создана"
                      :description="`ID: ${created.id} · ${new Date(created.createdAt).toLocaleString()}`"
                    />
                    <pre class="whitespace-pre-wrap break-words rounded-md bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-200">{{ summary || 'Заполните форму — здесь появится текст.' }}</pre>
                  </div>
                </template>
              </UCollapsible>
            </div>
          </UForm>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>
