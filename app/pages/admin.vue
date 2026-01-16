<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { ServiceRequestRecord } from '~/shared/service-request'

type AdminUser = { id: string; username: string }
type MeResponse = { ok: true; user: AdminUser | null }
type RequestsResponse = { ok: true; requests: ServiceRequestRecord[] }

useSeoMeta({
  title: 'Admin',
  robots: 'noindex, nofollow'
})

const toast = useToast()

const loginState = reactive({
  username: '',
  password: ''
})

const credentialsState = reactive({
  username: '',
  password: '',
  confirm: ''
})

const { data: meRes, refresh: refreshMe, pending: mePending } = await useFetch<MeResponse>('/api/admin/me')
const me = computed(() => meRes.value?.user ?? null)

const { data: requestsRes, refresh: refreshRequests, pending: requestsPending } = await useFetch<RequestsResponse>('/api/admin/requests', {
  immediate: false,
  default: () => ({ ok: true, requests: [] })
})
const requests = computed(() => requestsRes.value?.requests ?? [])

watch(
  me,
  (value) => {
    credentialsState.username = value?.username ?? ''
    credentialsState.password = ''
    credentialsState.confirm = ''
  },
  { immediate: true }
)

watchEffect(() => {
  if (me.value) refreshRequests()
})

function validateLogin(s: typeof loginState): FormError[] {
  const errors: FormError[] = []
  if (!s.username.trim()) errors.push({ name: 'username', message: 'Введите логин' })
  if (!s.password) errors.push({ name: 'password', message: 'Введите пароль' })
  return errors
}

async function onLoginSubmit(_event: FormSubmitEvent<any>) {
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: loginState })
    loginState.password = ''
    await refreshMe()
    toast.add({ title: 'Готово', description: 'Вы вошли в админку', color: 'primary' })
  } catch (err: any) {
    toast.add({
      title: 'Ошибка входа',
      description: String(err?.data?.statusMessage || err?.message || 'Не удалось войти'),
      color: 'warning'
    })
  }
}

function validateCredentials(s: typeof credentialsState): FormError[] {
  const errors: FormError[] = []
  if (!s.username.trim()) errors.push({ name: 'username', message: 'Введите новый логин' })
  if (s.password && s.password.length < 8) errors.push({ name: 'password', message: 'Пароль должен быть минимум 8 символов' })
  if (s.password && s.password !== s.confirm) errors.push({ name: 'confirm', message: 'Пароли не совпадают' })
  return errors
}

async function onCredentialsSubmit(_event: FormSubmitEvent<any>) {
  try {
    await $fetch('/api/admin/credentials', {
      method: 'PUT',
      body: {
        username: credentialsState.username,
        password: credentialsState.password || undefined
      }
    })
    await refreshMe()
    toast.add({ title: 'Сохранено', description: 'Данные обновлены', color: 'primary' })
  } catch (err: any) {
    toast.add({
      title: 'Не удалось сохранить',
      description: String(err?.data?.statusMessage || err?.message || 'Ошибка'),
      color: 'warning'
    })
  }
}

async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  await refreshMe()
  toast.add({ title: 'Вы вышли', color: 'neutral' })
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}
</script>

<template>
  <UContainer class="py-10">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div class="font-semibold">Админка</div>
          <div v-if="me" class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-300">Вы вошли как: {{ me.username }}</span>
            <UButton size="sm" color="neutral" variant="soft" label="Выйти" @click="logout" />
          </div>
        </div>
      </template>

      <div v-if="mePending" class="text-sm text-gray-600 dark:text-gray-300">Загрузка…</div>

      <div v-else-if="!me" class="max-w-md space-y-6">
        <div class="text-sm text-gray-600 dark:text-gray-300">
          Вход по учётке, созданной сидом (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).
        </div>

        <UForm :state="loginState" :validate="validateLogin" :validate-on="['blur', 'change']" @submit="onLoginSubmit">
          <div class="grid gap-4">
            <UFormField label="Логин" name="username" required>
              <UInput v-model="loginState.username" autocomplete="username" />
            </UFormField>
            <UFormField label="Пароль" name="password" required>
              <UInput v-model="loginState.password" type="password" autocomplete="current-password" />
            </UFormField>
            <UButton type="submit" :loading="mePending" label="Войти" />
          </div>
        </UForm>
      </div>

      <div v-else class="space-y-10">
        <div class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <div class="font-semibold">Заявки</div>
            <UButton size="sm" color="neutral" variant="soft" :loading="requestsPending" label="Обновить" @click="refreshRequests" />
          </div>

          <div v-if="requestsPending" class="text-sm text-gray-600 dark:text-gray-300">Загрузка заявок…</div>
          <div v-else-if="!requests.length" class="text-sm text-gray-600 dark:text-gray-300">Пока нет заявок.</div>

          <div v-else class="grid gap-3">
            <UCard v-for="r in requests" :key="r.id">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="text-sm font-medium">#{{ r.id }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-300">{{ formatDate(r.createdAt) }}</div>
              </div>
              <div class="mt-2 grid gap-2">
                <div class="text-sm"><span class="font-medium">Модель:</span> {{ r.model }}</div>
                <div v-if="r.serviceSlug" class="text-sm"><span class="font-medium">Услуга:</span> {{ r.serviceSlug }}</div>
                <div class="text-sm whitespace-pre-wrap"><span class="font-medium">Проблема:</span> {{ r.issue }}</div>
                <div class="text-sm"><span class="font-medium">Контакт:</span> {{ r.contact }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-300">Статус: {{ r.status }}</div>
              </div>
            </UCard>
          </div>
        </div>

        <div class="space-y-4">
          <div class="font-semibold">Сменить логин/пароль</div>
          <UForm :state="credentialsState" :validate="validateCredentials" :validate-on="['blur', 'change']" @submit="onCredentialsSubmit">
            <div class="grid gap-4 max-w-md">
              <UFormField label="Новый логин" name="username" required>
                <UInput v-model="credentialsState.username" autocomplete="username" />
              </UFormField>
              <UFormField label="Новый пароль" name="password">
                <UInput v-model="credentialsState.password" type="password" autocomplete="new-password" />
              </UFormField>
              <UFormField label="Повторите пароль" name="confirm">
                <UInput v-model="credentialsState.confirm" type="password" autocomplete="new-password" />
              </UFormField>
              <UButton type="submit" label="Сохранить" />
            </div>
          </UForm>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>
