import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ViewTransitions } from "next-view-transitions";
import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "SecPilot - AI-Powered Email Security",
  description:
    "SecPilot is an AI-powered email security platform that scans, classifies, and reports on potential email threats such as phishing, malware, and spam.",
  openGraph: {
    images: ["/banner.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" },
    { media: "(prefers-color-scheme: dark)", color: "#06b6d4" },
  ],
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en\" className="dark">
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