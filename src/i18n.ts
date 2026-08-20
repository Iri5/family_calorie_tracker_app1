import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import ru from './locales/ru/translation.json';

// Загружаем сохранённый язык из localStorage (если есть)
const savedLanguage = localStorage.getItem('i18nextLng') || 'ru';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en }
      
    },
    lng: savedLanguage, // язык по умолчанию – из localStorage
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false
    }
  });

// Сохраняем выбранный язык в localStorage при каждом изменении
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;