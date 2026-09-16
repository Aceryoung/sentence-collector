import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  SENTENCE_WITH_LIKE_COUNT_SELECT,
  toSentenceCardData,
} from "@/lib/sentences";
import { SentenceCard } from "@/components/SentenceCard";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://sentence-collector-zeta.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ source: string }>;
}): Promise<Metadata> {
  const { source } = await params;
  const decoded = decodeURIComponent(source);
  const title = `${decoded}의 문장 모음`;

  return {
    title,
    description: `'${decoded}'에서 발견한 문장들을 모아봅니다.`,
    openGraph: { title, type: "article" },
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ source: string }>;
}) {
  const { source: rawSource } = await params;
  const source = decodeURIComponent(rawSource);

  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("sentences")
    .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
    .eq("source", source)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const sentences = (rows ?? []).map(toSentenceCardData);

  if (sentences.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-serif text-xl font-bold text-ink">
          &lsquo;{source}&rsquo;의 문장이 없습니다
        </h1>
        <Link
          href="/works"
          className="mt-4 inline-block text-xs text-stone underline underline-offset-4 hover:text-ink"
        >
          ← 작품 목록으로
        </Link>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${source}의 문장 모음 — 글적`,
    description: `'${source}'에서 발견한 ${sentences.length}개의 문장`,
    url: `${SITE_URL}/works/${encodeURIComponent(source)}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "작품별 문장",
          item: `${SITE_URL}/works`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: source,
          item: `${SITE_URL}/works/${encodeURIComponent(source)}`,
        },
      ],
    },
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/works"
        className="mb-4 inline-block text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 작품 목록
      </Link>

      <h1 className="mb-2 font-serif text-2xl font-bold text-ink">{source}</h1>
      <p className="mb-8 text-sm text-stone">
        이 작품에서 발견한 {sentences.length}개의 문장
      </p>

      <ul className="flex flex-col gap-4">
        {sentences.map((s) => (
          <li key={s.id}>
            <SentenceCard {...s} />
          </li>
        ))}
      </ul>
    </main>
  );
}
