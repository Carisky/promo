<script setup lang="ts">
import { services } from '~/data/services'

useSeoMeta({
  title: 'Услуги',
  description: 'Список услуг по обслуживанию и ремонту ноутбуков.'
})
</script>

<template>
  <UContainer class="py-10">
    <div class="space-y-6">
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
          Услуги
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Подходит для домашних и рабочих ноутбуков. Работаю аккуратно и быстро.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard v-for="s in services" :key="s.slug" class="flex flex-col">
          <template #header>
            <div class="space-y-1">
              <div class="font-medium">
                {{ s.title }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ s.summary }}
              </div>
            </div>
          </template>

          <div class="mt-auto">
            <UButton :to="`/services/${s.slug}`" color="primary" variant="soft" block label="Подробнее" />
          </div>
        </UCard>
      </div>

      <UCard>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-300">
            Для расчёта стоимости — напишите модель ноутбука и что именно беспокоит.
          </div>
          <div class="flex gap-2">
            <UButton to="/request" color="primary" label="Оставить заявку" />
            <UButton to="/contacts" variant="soft" color="neutral" label="Контакты" />
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

