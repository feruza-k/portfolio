import type { Metadata } from "next";
import { Syne, JetBrains_Mono, Inter } from "next/font/google";
import { ScrollReset } from "@/components/layout/ScrollReset";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Feruza Kachkinbayeva — AI Engineer",
  description:
    "Applied AI Engineer in London. Building AI systems that turn complex data into decisions.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://feruza.dev"
  ),
  openGraph: {
    title: "Feruza Kachkinbayeva — AI Engineer",
    description:
      "Applied AI Engineer in London. Building AI systems that turn complex data into decisions.",
    url: "https://feruza.dev",
    siteName: "feruza.dev",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Feruza Kachkinbayeva — AI Engineer",
    description:
      "Applied AI Engineer in London. Building AI systems that turn complex data into decisions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${jetbrainsMono.variable} ${inter.variable}`}
    >
      <body className="bg-[#0c0c0e] text-[#f2ede6]">
        <ScrollReset />
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
