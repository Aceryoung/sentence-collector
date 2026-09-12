import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { EMOTION_TAGS } from "@/lib/validation";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://sentence-collector-zeta.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/practice`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/ranking`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/challenges`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // 개별 문장 페이지
  const { data: sentences } = await supabase
    .from("sentences")
    .select("id, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1000);

  const sentencePages: MetadataRoute.Sitemap = (sentences ?? []).map((s) => ({
    url: `${SITE_URL}/sentences/${s.id}`,
    lastModified: new Date(s.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // 태그별 큐레이션 페이지
  const tagPages: MetadataRoute.Sitemap = EMOTION_TAGS.map((tag) => ({
    url: `${SITE_URL}/tags/${encodeURIComponent(tag)}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...tagPages, ...sentencePages];
}
