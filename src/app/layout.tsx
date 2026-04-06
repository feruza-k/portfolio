import type { Metadata } from "next";
import { Playfair_Display, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
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
    "Data scientist and AI engineer. Building AI systems from start to finish — the kind that actually get used.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://feruza.dev"
  ),
  openGraph: {
    title: "Feruza Kachkinbayeva — AI Engineer",
    description:
      "Data scientist and AI engineer. Building AI systems from start to finish.",
    url: "https://feruza.dev",
    siteName: "feruza.dev",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Feruza Kachkinbayeva — AI Engineer",
    description:
      "Data scientist and AI engineer. Building AI systems from start to finish.",
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
      className={`${playfair.variable} ${jetbrainsMono.variable} ${inter.variable}`}
    >
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
