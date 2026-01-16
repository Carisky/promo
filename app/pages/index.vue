<script setup lang="ts">
import { services } from '~/data/services'

useSeoMeta({
  title: 'Контактный центр',
  description: 'Обслуживание и ремонт ноутбуков: чистка охлаждения, замена HDD/SSD, RAM, переустановка ОС, оптимизация.'
})

const config = useRuntimeConfig()
const phone = computed(() => String(config.public.contactPhone || ''))
const telegramUrl = computed(() => String(config.public.contactTelegramUrl || ''))
</script>

<template>
  <UContainer class="py-10">
    <div class="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div class="space-y-4">
        <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ремонт и обслуживание ноутбуков
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Аккуратно и быстро. Только необходимые работы — без навязывания лишнего.
        </p>

        <div class="flex flex-wrap gap-2">
          <UButton to="/request" color="primary" size="lg" label="Описать проблему" />
          <UButton to="/services" variant="soft" color="neutral" size="lg" label="Список услуг" />
          <UButton
            v-if="telegramUrl"
            :to="telegramUrl"
            target="_blank"
            rel="noreferrer"
            variant="soft"
            color="primary"
            size="lg"
            icon="simple-icons:telegram"
            label="Написать в Telegram"
          />
        </div>

        <div class="text-sm text-gray-600 dark:text-gray-300">
          <span v-if="phone">Телефон: {{ phone }}</span>
        </div>
      </div>

      <UCard>
        <template #header>
          <div class="font-medium">
            Частые задачи
          </div>
        </template>

        <div class="grid gap-3 sm:grid-cols-2">
          <UButton
            v-for="s in services.slice(0, 6)"
            :key="s.slug"
            :to="`/services/${s.slug}`"
            variant="soft"
            color="neutral"
            class="justify-start"
            :label="s.title"
          />
        </div>

        <template #footer>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm text-gray-600 dark:text-gray-300">
              Нужен расчёт стоимости? Напишите, что за модель и симптомы.
            </div>
            <UButton to="/contacts" variant="ghost" color="neutral" label="Контакты" />
          </div>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>
