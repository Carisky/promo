<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { SERVICE_REQUEST_STATUS_OPTIONS, isServiceRequestStatus, type ServiceRequestRecord, type ServiceRequestStatus } from '~/shared/service-request'

type AdminUser = { id: string; username: string }
type MeResponse = { ok: true; user: AdminUser | null }
type RequestsResponse = { ok: true; requests: ServiceRequestRecord[] }

type AdminSection = 'dashboard' | 'requests' | 'profile' | 'security'

definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Admin',
  robots: 'noindex, nofollow'
})

const toast = useToast()

const section = ref<AdminSection>('dashboard')
const mobileSidebarOpen = ref(false)

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
const statusUpdating = reactive<Record<string, boolean>>({})

function statusLabel(status: ServiceRequestStatus) {
  return SERVICE_REQUEST_STATUS_OPTIONS.find(o => o.value === status)?.label ?? status
}

async function updateRequestStatus(id: string, value: unknown) {
  if (!requestsRes.value) return
  if (!isServiceRequestStatus(value)) return

  const nextStatus = value
  const prevStatus = requestsRes.value.requests.find(r => r.id === id)?.status
  if (!prevStatus || prevStatus === nextStatus) return

  statusUpdating[id] = true
  requestsRes.value.requests = requestsRes.value.requests.map(r => (r.id === id ? { ...r, status: nextStatus } : r))

  try {
    await $fetch(`/api/admin/requests/${id}`, {
      method: 'PUT',
      body: { status: nextStatus }
    })
    toast.add({ title: 'Сохранено', description: `Статус: ${statusLabel(nextStatus)}`, color: 'primary' })
  } catch (err: any) {
    requestsRes.value.requests = requestsRes.value.requests.map(r => (r.id === id ? { ...r, status: prevStatus } : r))
    toast.add({
      title: 'Не удалось обновить статус',
      description: String(err?.data?.statusMessage || err?.message || 'Ошибка'),
      color: 'warning'
    })
  } finally {
    statusUpdating[id] = false
  }
}

watch(
  me,
  (value) => {
    credentialsState.username = value?.username ?? ''
    credentialsState.password = ''
    credentialsState.confirm = ''

    if (value) {
      section.value = 'dashboard'
      mobileSidebarOpen.value = false
    }
  },
  { immediate: true }
)

watch(
  me,
  (value) => {
    if (value) refreshRequests()
  },
  { immediate: true }
)

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
    toast.add({ title: 'Готово', description: 'Вы вошли в админку.', color: 'primary' })
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
    toast.add({ title: 'Сохранено', description: 'Данные обновлены.', color: 'primary' })
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

const latestRequest = computed(() => requests.value[0] ?? null)
</script>

<template>
  <div class="min-h-screen">
    <div v-if="mePending" class="mx-auto max-w-5xl p-6 text-sm text-gray-600 dark:text-gray-300">Загрузка…</div>

    <div v-else-if="!me" class="mx-auto flex min-h-screen max-w-md items-center p-6">
      <UCard class="w-full">
        <template #header>
          <div class="font-semibold">Вход в админку</div>
        </template>

        <div class="space-y-6">
          <div class="text-sm text-gray-600 dark:text-gray-300">
            Вход по учётке, созданной в env (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).
          </div>

          <UForm :state="loginState" :validate="validateLogin" :validate-on="['blur', 'change']" @submit="onLoginSubmit">
            <div class="grid gap-4">
              <UFormField label="Логин" name="username" required>
                <UInput v-model="loginState.username" autocomplete="username" />
              </UFormField>
              <UFormField label="Пароль" name="password" required>
                <UInput v-model="loginState.password" type="password" autocomplete="current-password" />
              </UFormField>
              <UButton type="submit" block label="Войти" />
            </div>
          </UForm>
        </div>
      </UCard>
    </div>

    <div v-else class="flex min-h-screen">
      <aside class="hidden w-64 shrink-0 border-r border-gray-200/60 bg-white p-4 dark:border-gray-800/60 dark:bg-gray-950 md:block">
        <div class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Навигация</div>
        <div class="mt-3 grid gap-2">
          <UButton
            :variant="section === 'dashboard' ? 'solid' : 'soft'"
            color="neutral"
            icon="heroicons:squares-2x2-20-solid"
            class="w-full justify-start"
            label="Dashboard"
            @click="section = 'dashboard'"
          />
          <UButton
            :variant="section === 'requests' ? 'solid' : 'soft'"
            color="neutral"
            icon="heroicons:inbox-stack-20-solid"
            class="w-full justify-start"
            label="Заявки"
            @click="section = 'requests'"
          />
        </div>
      </aside>

      <Teleport to="body">
        <div v-if="mobileSidebarOpen" class="fixed inset-0 z-50 md:hidden" @click.self="mobileSidebarOpen = false">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div class="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-gray-950">
            <div class="flex items-center justify-between border-b border-gray-200/60 p-4 dark:border-gray-800/60">
              <div class="font-semibold">Меню</div>
              <UButton variant="ghost" color="neutral" icon="heroicons:x-mark-20-solid" aria-label="Закрыть" @click="mobileSidebarOpen = false" />
            </div>
            <div class="grid gap-2 p-4">
              <UButton
                :variant="section === 'dashboard' ? 'solid' : 'soft'"
                color="neutral"
                icon="heroicons:squares-2x2-20-solid"
                class="w-full justify-start"
                label="Dashboard"
                @click="section = 'dashboard'; mobileSidebarOpen = false"
              />
              <UButton
                :variant="section === 'requests' ? 'solid' : 'soft'"
                color="neutral"
                icon="heroicons:inbox-stack-20-solid"
                class="w-full justify-start"
                label="Заявки"
                @click="section = 'requests'; mobileSidebarOpen = false"
              />
            </div>
          </div>
        </div>
      </Teleport>

      <div class="min-w-0 flex-1">
        <header class="sticky top-0 z-10 border-b border-gray-200/60 bg-white/80 backdrop-blur dark:border-gray-800/60 dark:bg-gray-950/80">
          <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div class="flex items-center gap-2">
              <UButton
                class="md:hidden"
                variant="ghost"
                color="neutral"
                icon="heroicons:bars-3-20-solid"
                aria-label="Открыть меню"
                @click="mobileSidebarOpen = true"
              />
              <div class="font-semibold">
                {{ section === 'dashboard' ? 'Dashboard' : section === 'requests' ? 'Заявки' : section === 'profile' ? 'Профиль' : 'Смена пароля' }}
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-end gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-300">Вы: {{ me.username }}</span>
              <UButton size="sm" color="neutral" variant="soft" label="Профиль" @click="section = 'profile'" />
              <UButton size="sm" color="neutral" variant="soft" label="Сменить пароль" @click="section = 'security'" />
              <UButton size="sm" color="neutral" variant="ghost" label="Выйти" @click="logout" />
            </div>
          </div>
        </header>

        <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div v-if="section === 'dashboard'" class="grid gap-4 sm:grid-cols-2">
            <UCard>
              <div class="text-sm text-gray-600 dark:text-gray-300">Всего заявок</div>
              <div class="mt-2 flex items-baseline gap-3">
                <div class="text-3xl font-semibold tabular-nums">{{ requestsPending ? '…' : requests.length }}</div>
                <UButton size="xs" color="neutral" variant="soft" :loading="requestsPending" label="Обновить" @click="refreshRequests" />
              </div>
            </UCard>

            <UCard>
              <div class="text-sm text-gray-600 dark:text-gray-300">Последняя заявка</div>
              <div class="mt-2 text-sm">
                <span v-if="requestsPending">Загрузка…</span>
                <span v-else-if="!latestRequest" class="text-gray-600 dark:text-gray-300">Пока нет заявок.</span>
                <span v-else>#{{ latestRequest.id }} · {{ formatDate(latestRequest.createdAt) }}</span>
              </div>
            </UCard>
          </div>

          <div v-else-if="section === 'profile'" class="max-w-xl">
            <UCard>
              <template #header>
                <div class="font-semibold">Профиль</div>
              </template>
              <div class="grid gap-2 text-sm">
                <div><span class="font-medium">ID:</span> {{ me.id }}</div>
                <div><span class="font-medium">Логин:</span> {{ me.username }}</div>
              </div>
            </UCard>
          </div>

          <div v-else-if="section === 'security'" class="max-w-xl">
            <UCard>
              <template #header>
                <div class="font-semibold">Смена логина/пароля</div>
              </template>
              <UForm :state="credentialsState" :validate="validateCredentials" :validate-on="['blur', 'change']" @submit="onCredentialsSubmit">
                <div class="grid gap-4">
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
            </UCard>
          </div>

          <div v-else class="space-y-4">
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
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="text-xs text-gray-600 dark:text-gray-300">Статус</div>
                    <USelect
                      :items="SERVICE_REQUEST_STATUS_OPTIONS"
                      value-key="value"
                      label-key="label"
                      size="sm"
                      class="w-full sm:w-64"
                      :model-value="r.status"
                      :disabled="requestsPending || statusUpdating[r.id]"
                      @update:model-value="(v) => updateRequestStatus(r.id, v)"
                    />
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
