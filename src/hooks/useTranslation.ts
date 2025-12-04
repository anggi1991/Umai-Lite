import { useState, useEffect } from 'react';
import { i18n, Language } from '../i18n';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(i18n.getCurrentLanguage());

  useEffect(() => {
    const unsubscribe = i18n.subscribe((newLang) => {
      setLanguage(newLang);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    t: i18n.t.bind(i18n),
    plural: i18n.plural.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatRelativeTime: i18n.formatRelativeTime.bind(i18n),
    language,
    setLanguage: i18n.setLanguage.bind(i18n),
  };
}
