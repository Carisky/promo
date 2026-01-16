<script setup lang="ts">
const config = useRuntimeConfig()

const phone = computed(() => String(config.public.contactPhone || ''))
const telegramUrl = computed(() => String(config.public.contactTelegramUrl || ''))
const telHref = computed(() => (phone.value ? `tel:${phone.value.replace(/[^\d+]/g, '')}` : ''))
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-10 border-b border-gray-200/60 bg-white/70 backdrop-blur dark:border-gray-800/60 dark:bg-gray-950/70">
      <UContainer class="flex items-center justify-between py-3">
        <NuxtLink to="/" class="font-semibold tracking-tight">
          Сервис ноутбуков
        </NuxtLink>

        <nav class="flex items-center gap-2">
          <UButton to="/services" variant="ghost" color="neutral" label="Услуги" />
          <UButton to="/contacts" variant="ghost" color="neutral" label="Контакты" />
          <UButton to="/request" color="primary" label="Оставить заявку" />
        </nav>
      </UContainer>
    </header>

    <main>
      <slot />
    </main>

    <footer class="mt-16 border-t border-gray-200/60 dark:border-gray-800/60">
      <UContainer class="flex flex-col gap-3 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-300">
          Работаю аккуратно и быстро — только необходимые работы, без навязывания лишнего.
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            v-if="telegramUrl"
            :to="telegramUrl"
            target="_blank"
            rel="noreferrer"
            color="primary"
            variant="soft"
            icon="simple-icons:telegram"
            label="Написать в Telegram"
          />
          <UButton
            v-if="telHref"
            :to="telHref"
            color="neutral"
            variant="soft"
            icon="heroicons:phone-20-solid"
            label="Позвонить"
          />
        </div>
      </UContainer>
    </footer>
  </div>
</template>
