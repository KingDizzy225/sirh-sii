import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const nextLang = i18n.language === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(nextLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors"
        >
            <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-slate-400" />
                <span>Langue: {i18n.language === 'fr' ? 'FR' : 'EN'}</span>
            </div>
        </button>
    );
}
