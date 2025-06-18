# Internationalization (i18n) Implementation

This document describes the internationalization setup for SecPilot using Lingo.dev and Next.js 15.

## Features

✅ **Automatic Browser Language Detection**: Users are automatically redirected to their preferred
language based on browser settings ✅ **Subpath-based Routing**: Clean URLs like `/en/`, `/es/`,
`/fr/`, `/de/` ✅ **Language Persistence**: User language preference is stored in cookies ✅
**Language Switcher**: Easy language switching in both desktop and mobile navigation ✅ **SEO
Optimized**: Proper hreflang tags and metadata for each language ✅ **Static Generation**: All
language variants are pre-generated at build time ✅ **Hydration-safe**: Proper HTML structure to
avoid React hydration mismatches

## Supported Languages

- **English (en)** - Default language
- **Spanish (es)** - Español
- **French (fr)** - Français
- **German (de)** - Deutsch

## URL Structure

### Marketing Pages (Localized)

- `/` → Redirects to `/en/` (or user's preferred language)
- `/en/` → English homepage
- `/es/` → Spanish homepage
- `/fr/` → French homepage
- `/de/` → German homepage

### Application Pages (Non-localized)

- `/dashboard/*` → Dashboard pages (English only)
- `/auth/*` → Authentication pages (English only)
- `/login`, `/register`, `/pricing`, `/contact` → Utility pages (English only)

## Implementation Details

### Middleware (`src/middleware.ts`)

- Detects browser language from `Accept-Language` header
- Checks for stored language preference in cookies
- Redirects root path `/` to appropriate language subpath
- Excludes dashboard and auth routes from localization

### Language Switching (`src/components/language-switcher.tsx`)

- Dropdown menu with flag icons and language names
- Sets locale cookie for persistence
- Smart URL handling:
    - On localized routes: Changes language in URL
    - On non-localized routes: Redirects to homepage with selected language

### Route Structure

```
src/app/
├── layout.tsx              # Root layout with hreflang links
├── page.tsx                # Root page (redirected by middleware)
├── [lang]/
│   ├── layout.tsx          # Locale-specific layout with metadata
│   └── page.tsx            # Localized homepage
├── dashboard/              # Non-localized application routes
├── auth/                   # Non-localized auth routes
└── (other routes)          # Non-localized utility routes
```

### HTML Structure & Hydration Safety

- **Root Layout**: Provides base `<html>` and `<body>` tags with hreflang links
- **Locale Layout**: Only provides `LocaleProvider` wrapper (no HTML tags)
- **LanguageAttributeUpdater**: Client component that dynamically updates HTML lang attribute
- **No Nested HTML**: Prevents hydration mismatches by avoiding nested `<html>` tags

### Locale Context (`src/lib/locale-context.tsx`)

Provides current locale to React components:

```tsx
import { useLocale } from '@/lib/locale-context';

function MyComponent() {
    const { locale, locales } = useLocale();
    return <div>Current language: {locale}</div>;
}
```

### Language Attribute Updater (`src/components/language-attribute-updater.tsx`)

Client-side component that updates HTML attributes based on current route:

```tsx
// Updates document.documentElement.lang and data-lingodotdev-compiler
// Runs on every route change to ensure proper language attributes
```

### Lingo.dev Integration

- Configured in `next.config.mjs` with Lingo compiler
- Translation files in `src/lingo/` directory
- Uses `'use i18n'` directive for automatic translation detection
- Supports 4 target locales: es, fr, de (with en as source)

## SEO Features

### Metadata per Language

Each language has customized:

- Page titles
- Meta descriptions
- OpenGraph locale settings
- Hreflang alternate links

### Hreflang Implementation

```html
<link rel="alternate" hreflang="en" href="/" />
<link rel="alternate" hreflang="es" href="/es" />
<link rel="alternate" hreflang="fr" href="/fr" />
<link rel="alternate" hreflang="de" href="/de" />
<link rel="alternate" hreflang="x-default" href="/" />
```

## Usage

### For Users

1. Visit the site - automatically redirected to preferred language
2. Use language switcher in navigation to change languages
3. Language preference is remembered for future visits

### For Developers

1. Add `'use i18n'` directive to components that need translation
2. Use regular text - Lingo.dev automatically detects and manages translations
3. Translations are generated at build time and stored in `src/lingo/dictionary.js`

## Technical Notes

- Middleware runs on every request to handle language detection
- Static generation creates all language variants at build time
- Cookies store user language preference with 30-day expiration
- Language switcher handles edge cases for non-localized routes
- Locale context provides React hooks for language-aware components
- **Hydration-safe**: No nested HTML tags to prevent React hydration errors
- **Client-side language attributes**: HTML lang attribute updated dynamically

## Troubleshooting

### Hydration Errors

If you encounter hydration errors:

1. Ensure no nested `<html>` or `<body>` tags in layouts
2. Use `LanguageAttributeUpdater` for dynamic HTML attributes
3. Keep locale-specific metadata in the locale layout, not root layout

### Language Detection Issues

1. Check browser `Accept-Language` header format
2. Verify cookie storage and expiration
3. Ensure middleware is not being skipped for the route

## Future Enhancements

- [ ] Add more languages (Italian, Portuguese, etc.)
- [ ] Implement RTL support for Arabic/Hebrew
- [ ] Add language-specific number/date formatting
- [ ] Implement client-side translation caching
- [ ] Add language detection based on user account preferences
