import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ViewTransitions } from "next-view-transitions";
import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "SecPilot - Advanced Email Security Software | AI-Powered Phishing & Malware Protection",
  description:
    "Protect your business from email attacks with SecPilot's AI-powered email security software. Detect phishing, malware, ransomware & business email compromise with 99.9% accuracy. Works with Gmail, Outlook & Office 365. Starting at $19/month. Free trial available.",
  keywords: [
    "email security software",
    "phishing protection",
    "malware detection",
    "ransomware prevention",
    "business email compromise",
    "AI email security",
    "email threat detection",
    "Gmail security",
    "Outlook security",
    "Office 365 security",
    "small business email protection",
    "enterprise email security",
    "email security for business",
    "cyber security email",
    "email filtering software"
  ],
  openGraph: {
    title: "SecPilot - AI-Powered Email Security Software",
    description: "Advanced email threat protection for businesses. Detect phishing, malware & ransomware with 99.9% accuracy. Free trial available.",
    images: ["/banner.png"],
    type: "website",
    url: "https://secpilot.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "SecPilot - AI-Powered Email Security Software",
    description: "Advanced email threat protection for businesses. Detect phishing, malware & ransomware with 99.9% accuracy.",
    images: ["/banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" },
    { media: "(prefers-color-scheme: dark)", color: "#06b6d4" },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SecPilot",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": ["Windows", "macOS", "Linux", "iOS", "Android"],
    "description": "AI-powered email security software that detects phishing, malware, ransomware, and business email compromise attacks",
    "offers": {
      "@type": "Offer",
      "price": "19",
      "priceCurrency": "USD",
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock"
    },
    "provider": {
      "@type": "Organization",
      "name": "SecPilot",
      "url": "https://secpilot.com"
    },
    "screenshot": "https://secpilot.com/hero-screenshot.avif",
    "softwareVersion": "2.0",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    }
  };

  return (
    <ViewTransitions>
      <html lang="en\" className="dark">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        </head>
        <body
          className={cn(
            "bg-charcoal antialiased h-full w-full"
          )}
        >
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
