'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const locales = ['en', 'es', 'fr', 'de'];

export function LanguageAttributeUpdater() {
    const pathname = usePathname();

    useEffect(() => {
        // Extract locale from pathname
        const segments = pathname.split('/');
        const locale = segments[1] && locales.includes(segments[1]) ? segments[1] : 'en';

        // Update HTML lang attribute
        document.documentElement.lang = locale;
        document.documentElement.setAttribute('data-lingodotdev-compiler', locale);
    }, [pathname]);

    return null;
}
