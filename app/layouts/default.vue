<script setup lang="ts">
const config = useRuntimeConfig()

const phone = computed(() => String(config.public.contactPhone || ''))
const telegramUrl = computed(() => String(config.public.contactTelegramUrl || ''))
const telHref = computed(() => (phone.value ? `tel:${phone.value.replace(/[^\d+]/g, '')}` : ''))

const route = useRoute()
const mobileMenuOpen = ref(false)

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function onWindowKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMobileMenu()
}

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu()
  }
)

watch(mobileMenuOpen, open => {
  if (!import.meta.client) return

  document.body.style.overflow = open ? 'hidden' : ''

  if (open) window.addEventListener('keydown', onWindowKeydown)
  else window.removeEventListener('keydown', onWindowKeydown)
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onWindowKeydown)
})
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-10 border-b border-gray-200/60 bg-white/70 backdrop-blur dark:border-gray-800/60 dark:bg-gray-950/70">
      <UContainer class="flex items-center justify-between py-3">
        <NuxtLink to="/" class="font-semibold tracking-tight">
          Сервис ноутбуков
        </NuxtLink>

        <nav class="hidden items-center gap-2 sm:flex">
          <UButton to="/services" variant="ghost" color="neutral" label="Услуги" />
          <UButton to="/contacts" variant="ghost" color="neutral" label="Контакты" />
          <UButton to="/request" color="primary" label="Оставить заявку" />
        </nav>

        <UButton
          class="sm:hidden"
          variant="ghost"
          color="neutral"
          icon="heroicons:bars-3-20-solid"
          aria-label="Открыть меню"
          @click="mobileMenuOpen = true"
        />
      </UContainer>
    </header>

    <Teleport to="body">
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-50 sm:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Меню"
        @click.self="closeMobileMenu"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <div class="absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-gray-950">
          <div class="flex items-center justify-between border-b border-gray-200/60 p-4 dark:border-gray-800/60">
            <div class="font-semibold tracking-tight">Меню</div>
            <UButton
              variant="ghost"
              color="neutral"
              icon="heroicons:x-mark-20-solid"
              aria-label="Закрыть меню"
              @click="closeMobileMenu"
            />
          </div>

          <div class="flex flex-col gap-2 p-4">
            <UButton class="w-full justify-start" to="/services" variant="ghost" color="neutral" label="Услуги" @click="closeMobileMenu" />
            <UButton class="w-full justify-start" to="/contacts" variant="ghost" color="neutral" label="Контакты" @click="closeMobileMenu" />
            <UButton class="w-full justify-start" to="/request" color="primary" label="Оставить заявку" @click="closeMobileMenu" />
          </div>
        </div>
      </div>
    </Teleport>

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
