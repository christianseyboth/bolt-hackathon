'use client';

import { createContext, useContext, ReactNode } from 'react';

type LocaleContextType = {
    locale: string;
    locales: string[];
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

type LocaleProviderProps = {
    children: ReactNode;
    locale: string;
};

export function LocaleProvider({ children, locale }: LocaleProviderProps) {
    const locales = ['en', 'es', 'fr', 'de'];

    return <LocaleContext.Provider value={{ locale, locales }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (context === undefined) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
}
