import { useTranslation } from 'react-i18next';

export function useI18n() {
  const { t, i18n, ready } = useTranslation();

  return {
    t,
    i18n,
    ready,
    locale: i18n.language,
    changeLanguage: (lng: string) => i18n.changeLanguage(lng),
    isRTL: i18n.dir() === 'rtl',
  };
}