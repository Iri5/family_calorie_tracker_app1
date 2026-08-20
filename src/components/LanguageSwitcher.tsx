import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex gap-1 p-1 rounded-md bg-muted/50">
      <button
        onClick={() => setLanguage('ru')}
        className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
          i18n.language === 'ru'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
        }`}
      >
        🇷🇺 RU
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
          i18n.language === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}