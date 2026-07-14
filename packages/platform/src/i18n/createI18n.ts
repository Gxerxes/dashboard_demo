import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { I18nConfig } from '../types';

export function createI18n(config: I18nConfig) {
  i18n.use(initReactI18next).init({
    resources: {},
    lng: config.defaultLocale,
    fallbackLng: config.fallbackLocale,
    supportedLngs: config.supportedLocales,
    ns: [config.namespace],
    defaultNS: config.namespace,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

  return i18n;
}