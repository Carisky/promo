// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  pages: true,
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      titleTemplate: '%s · Сервис ноутбуков',
      meta: [
        { name: 'description', content: 'Обслуживание и ремонт ноутбуков: чистка охлаждения, SSD/HDD, RAM, переустановка ОС, оптимизация.' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      contactPhone: '+48 505 243 582',
      contactTelegramUrl: 'https://t.me/harnke'
    }
  }
})
