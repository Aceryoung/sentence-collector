import type { Metadata } from "next";
import { Literata } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";
import { ToastProvider } from "@/components/Toast";
import { FeedbackButton } from "@/components/FeedbackButton";
import "./globals.css";

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://geuljeok.vercel.app";

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
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "글적",
      url: SITE_URL,
      description: DESCRIPTION,
      inLanguage: "ko",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "글적",
      url: SITE_URL,
      description: "마음에 닿은 문장을 모으고, 필사하며, 감상을 나누는 문장 아카이브 서비스",
    },
  ];

  return (
    <html lang="ko" className={`h-full antialiased ${literata.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <ToastProvider>
          <TopBar />
          <div className="pb-16 sm:pb-0">
            {children}
          </div>
          <SiteFooter />
          <BottomNav />
          <FeedbackButton />
        </ToastProvider>
      </body>
    </html>
  );
}
