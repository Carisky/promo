<script setup lang="ts">
useSeoMeta({
  title: 'Контакты',
  description: 'Связаться для консультации и расчёта стоимости.'
})

const config = useRuntimeConfig()
const phone = computed(() => String(config.public.contactPhone || ''))
const telegramUrl = computed(() => String(config.public.contactTelegramUrl || ''))
const telHref = computed(() => (phone.value ? `tel:${phone.value.replace(/[^\d+]/g, '')}` : ''))
</script>

<template>
  <UContainer class="py-10">
    <div class="space-y-6">
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
          Контакты
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Для расчёта стоимости и консультации — пишите в Telegram или звоните напрямую.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="simple-icons:telegram" class="h-5 w-5" />
              <div class="font-medium">
                Telegram
              </div>
            </div>
          </template>
          <div class="space-y-3">
            <div class="text-sm text-gray-600 dark:text-gray-300">
              Быстрее всего отвечаю в сообщениях.
            </div>
            <UButton
              v-if="telegramUrl"
              :to="telegramUrl"
              target="_blank"
              rel="noreferrer"
              color="primary"
              label="Открыть чат"
            />
            <div v-else class="text-sm text-gray-600 dark:text-gray-300">
              Укажите `runtimeConfig.public.contactTelegramUrl` в `nuxt.config.ts`.
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="heroicons:phone-20-solid" class="h-5 w-5" />
              <div class="font-medium">
                Телефон
              </div>
            </div>
          </template>
          <div class="space-y-3">
            <div class="text-sm text-gray-600 dark:text-gray-300">
              Можно звонить или писать в мессенджеры по номеру.
            </div>
            <UButton v-if="telHref" :to="telHref" color="neutral" label="Позвонить" />
            <div v-if="phone" class="text-sm text-gray-600 dark:text-gray-300">
              {{ phone }}
            </div>
          </div>
        </UCard>
      </div>

      <UCard>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-300">
            Чтобы я быстрее сориентировался: модель ноутбука, симптомы, что уже пробовали.
          </div>
          <UButton to="/request" color="primary" label="Описать проблему" />
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
