import { LocaleSwitcher } from 'lingo.dev/react/client';

export function LanguageSwitcher() {
    return <LocaleSwitcher locales={['en', 'es', 'fr', 'de']} className='flex gap-2' />;
}
