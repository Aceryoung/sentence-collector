import type { Metadata } from "next";
import { Literata } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sentence-collector-zeta.vercel.app";

const DESCRIPTION = "문장을 모으고, 다시 꺼내보고, 나누는 곳";

export const metadata: Metadata = {
  // opengraph-image 를 절대 URL 로 뽑으려면 기준 주소가 있어야 한다.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "글적",
    template: "%s | 글적",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "글적",
    description: DESCRIPTION,
    siteName: "글적",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "글적",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`h-full antialiased ${literata.variable}`}>
      <body className="flex min-h-full flex-col">
        <TopBar />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
