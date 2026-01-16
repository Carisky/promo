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
      contactPhone: '+7 (999) 000-00-00',
      contactTelegramUrl: 'https://t.me/your_username'
    }
  }
})
