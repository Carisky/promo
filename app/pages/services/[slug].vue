<script setup lang="ts">
import { getServiceBySlug } from '~/data/services'
import type { Service } from '~/data/services'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const service = computed<Service>(() => {
  const found = getServiceBySlug(slug.value)
  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Услуга не найдена' })
  }
  return found
})

useSeoMeta({
  title: () => service.value.title,
  description: () => service.value.summary
})
</script>

<template>
  <UContainer class="py-10">
    <div class="space-y-6">
      <div class="space-y-2">
        <UButton to="/services" variant="ghost" color="neutral" icon="heroicons:arrow-left-20-solid" label="Назад к списку" />
        <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
          {{ service.title }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          {{ service.summary }}
        </p>
      </div>

      <UCard>
        <template #header>
          <div class="font-medium">
            Что входит
          </div>
        </template>

        <ul class="list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-200">
          <li v-for="b in service.bullets" :key="b">
            {{ b }}
          </li>
        </ul>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-sm text-gray-600 dark:text-gray-300">
              Точную цену скажу после уточнения модели и симптомов.
            </div>
            <UButton to="/request" color="primary" label="Описать проблему" />
          </div>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>
