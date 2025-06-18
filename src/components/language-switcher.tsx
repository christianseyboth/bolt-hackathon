'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconWorld, IconCheck } from '@tabler/icons-react';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // Extract current language from pathname
    const currentLang = pathname.split('/')[1] || 'en';
    const currentLanguage = languages.find((lang) => lang.code === currentLang) || languages[0];

    const handleLanguageChange = (langCode: string) => {
        // Set locale cookie
        document.cookie = `locale=${langCode}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;

        // Build new pathname
        const segments = pathname.split('/');
        const isOnLocalizedRoute = languages.some((lang) => lang.code === segments[1]);

        // For non-localized routes (dashboard, auth, etc.), redirect to home with language
        const nonLocalizedRoutes = [
            '/dashboard',
            '/auth',
            '/login',
            '/register',
            '/reset-password',
            '/setup-account',
            '/contact',
            '/pricing',
        ];
        const isOnNonLocalizedRoute = nonLocalizedRoutes.some((route) =>
            pathname.startsWith(route)
        );

        let newPathname: string;
        if (isOnNonLocalizedRoute) {
            // Redirect to home page with selected language
            newPathname = `/${langCode}`;
        } else if (isOnLocalizedRoute) {
            // Replace current language with new one
            segments[1] = langCode;
            newPathname = segments.join('/');
        } else {
            // Add language prefix for root or unlocalized marketing pages
            newPathname = `/${langCode}${pathname === '/' ? '' : pathname}`;
        }

        // Navigate to new URL
        router.push(newPathname);
        setIsOpen(false);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    size='sm'
                    className='flex items-center gap-2 text-neutral-400 hover:text-white'
                >
                    <IconWorld className='h-4 w-4' />
                    <span className='hidden sm:inline'>{currentLanguage.name}</span>
                    <span className='sm:hidden'>{currentLanguage.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='min-w-[160px]'>
                {languages.map((language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className='flex items-center justify-between cursor-pointer'
                    >
                        <div className='flex items-center gap-2'>
                            <span className='text-lg'>{language.flag}</span>
                            <span>{language.name}</span>
                        </div>
                        {currentLang === language.code && (
                            <IconCheck className='h-4 w-4 text-emerald-500' />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
