import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from 'i18next';

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Initialize with saved language or default to 'en'
    const [language, setLanguageState] = useState<string>(() => {
        return localStorage.getItem('preferred_language') || i18n.language || 'en';
    });

    const setLanguage = (lang: string) => {
        // Crucial: This updates i18next so all useTranslation() hooks re-render instantly
        i18n.changeLanguage(lang);
        setLanguageState(lang);
        localStorage.setItem('preferred_language', lang);
    };

    useEffect(() => {
        const savedLang = localStorage.getItem('preferred_language') || 'en';
        if (i18n.language !== savedLang) {
            i18n.changeLanguage(savedLang);
        }
        setLanguageState(savedLang);
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}