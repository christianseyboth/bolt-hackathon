import type { Metadata } from 'next';
import './globals.css';
import { LanguageAttributeUpdater } from '@/components/language-attribute-updater';

export const metadata: Metadata = {
    title: 'SecPilot',
    description: 'AI-Powered Email Security Software',
};

type Props = {
    children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
    return (
        <html className='dark' lang='en' data-lingodotdev-compiler='en'>
            <head>
                <link rel='alternate' hrefLang='en' href='/' />
                <link rel='alternate' hrefLang='es' href='/es' />
                <link rel='alternate' hrefLang='fr' href='/fr' />
                <link rel='alternate' hrefLang='de' href='/de' />
                <link rel='alternate' hrefLang='x-default' href='/' />
            </head>
            <body>
                <LanguageAttributeUpdater />
                {children}
            </body>
        </html>
    );
}
