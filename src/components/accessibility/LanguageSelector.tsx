import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <span role="img" aria-label="language">🌐</span>
        Language / Langue / Idioma
      </h3>
      
      <div className="space-y-2">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`
              w-full flex items-center gap-3 p-2 rounded transition-colors text-left
              ${i18n.language === language.code 
                ? 'bg-blue-100 border-2 border-blue-500 text-blue-900' 
                : 'hover:bg-gray-100 border-2 border-transparent'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            aria-pressed={i18n.language === language.code}
          >
            <span role="img" aria-hidden="true" className="text-lg">
              {language.flag}
            </span>
            <span className="font-medium">{language.name}</span>
            {i18n.language === language.code && (
              <span className="ml-auto text-blue-600" aria-label="selected">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Current: {languages.find(l => l.code === i18n.language)?.name || 'Unknown'}
        </p>
      </div>
    </div>
  );
};
