import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LocaleProvider } from '@/lib/locale-context';

type Props = {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
};

const locales = ['en', 'es', 'fr', 'de'];

// Locale-specific metadata
const localeMetadata: Record<string, Metadata> = {
    en: {
        title: 'SecPilot - Advanced Email Security Software | Phishing Protection',
        description:
            "Protect your business from email threats with SecPilot's AI-powered security. Stop phishing, malware, and ransomware attacks with 99.9% accuracy.",
    },
    es: {
        title: 'SecPilot - Software Avanzado de Seguridad de Email | Protección contra Phishing',
        description:
            'Protege tu negocio de las amenazas de email con la seguridad impulsada por IA de SecPilot. Detén ataques de phishing, malware y ransomware con 99.9% de precisión.',
    },
    fr: {
        title: 'SecPilot - Logiciel Avancé de Sécurité Email | Protection Anti-Phishing',
        description:
            'Protégez votre entreprise des menaces email avec la sécurité IA de SecPilot. Arrêtez les attaques de phishing, malware et ransomware avec 99.9% de précision.',
    },
    de: {
        title: 'SecPilot - Erweiterte E-Mail-Sicherheitssoftware | Phishing-Schutz',
        description:
            'Schützen Sie Ihr Unternehmen vor E-Mail-Bedrohungen mit SecPilots KI-gestützter Sicherheit. Stoppen Sie Phishing-, Malware- und Ransomware-Angriffe mit 99,9% Genauigkeit.',
    },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;

    if (!locales.includes(lang)) {
        return localeMetadata.en; // fallback to English
    }

    return {
        ...localeMetadata[lang],
        alternates: {
            languages: {
                en: '/',
                es: '/es',
                fr: '/fr',
                de: '/de',
                'x-default': '/',
            },
        },
        openGraph: {
            locale: lang,
            alternateLocale: locales.filter((l) => l !== lang),
        },
    };
}

export async function generateStaticParams() {
    return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({ children, params }: Props) {
    const { lang } = await params;

    // Validate that the locale is supported
    if (!locales.includes(lang)) {
        notFound();
    }

    return <LocaleProvider locale={lang}>{children}</LocaleProvider>;
}
