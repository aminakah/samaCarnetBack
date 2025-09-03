import { defineConfig } from '@adonisjs/i18n'

const i18nConfig = defineConfig({
  defaultLocale: 'fr',
  formatter: (message: any, locale: any, i18n: any) => {
    return i18n.formatMessage(message, {}, { locale })
  },
  loaders: async () => {
    const { FsLoader } = await import('@adonisjs/i18n/loaders/fs')
    return [new FsLoader()]
  },
  translationsFormat: 'json',
})

export default i18nConfig

/**
 * Supported locales configuration
 */
export const supportedLocales = {
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    dir: 'ltr'
  },
  wo: {
    name: 'Wolof',
    flag: '🇸🇳',
    dir: 'ltr'
  },
  en: {
    name: 'English',
    flag: '🇺🇸',
    dir: 'ltr'
  }
}
