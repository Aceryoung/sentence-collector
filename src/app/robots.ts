import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://geuljeok.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/auth/"],
      },
      // AI 검색 크롤러 명시적 허용
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot"],
        allow: "/",
        disallow: ["/admin", "/api/", "/auth/"],
      },
      // 훈련 데이터용 크롤러 차단
      {
        userAgent: ["CCBot", "Bytespider", "anthropic-ai"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
