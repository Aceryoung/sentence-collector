import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EMOTION_TAGS } from "@/lib/validation";
import {
  SENTENCE_WITH_LIKE_COUNT_SELECT,
  toSentenceCardData,
} from "@/lib/sentences";
import { SentenceCard } from "@/components/SentenceCard";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://sentence-collector-zeta.vercel.app";

/** 태그별 큐레이션 설명 (AI 인용 가능한 정보 블록) */
const TAG_DESCRIPTIONS: Record<string, string> = {
  위로:
    "힘든 하루를 보낸 당신에게 건네는 위로의 문장 모음입니다. 상실, 이별, 지친 마음에 조용히 다가오는 글귀를 모았습니다. 혼자가 아니라는 걸 느끼게 해주는 문장들을 천천히 읽어보세요.",
  동기부여:
    "새로운 시작과 도전에 용기를 주는 동기부여 문장 모음입니다. 포기하고 싶을 때, 방향을 잃었을 때, 다시 일어설 힘을 주는 글귀를 모았습니다.",
  사랑:
    "사랑에 대한 아름다운 문장 모음입니다. 설렘, 그리움, 함께하는 시간의 소중함을 담은 글귀를 모았습니다. 사랑하는 사람에게 전하고 싶은 문장을 찾아보세요.",
  깨달음:
    "삶의 지혜와 깊은 깨달음을 담은 문장 모음입니다. 철학, 문학, 일상에서 발견한 통찰을 모았습니다. 생각의 폭을 넓혀주는 문장들을 만나보세요.",
  유머:
    "웃음과 재치가 담긴 유머 문장 모음입니다. 무거운 일상에 가볍게 웃음을 선사하는 글귀를 모았습니다. 센스 있는 한 줄로 하루를 밝혀보세요.",
};

export async function generateStaticParams() {
  return EMOTION_TAGS.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  if (!EMOTION_TAGS.includes(decoded as (typeof EMOTION_TAGS)[number]))
    return { title: "태그를 찾을 수 없습니다" };

  const title = `${decoded} 문장 모음`;
  const description =
    TAG_DESCRIPTIONS[decoded] ?? `${decoded} 감정이 담긴 문장을 모아봤습니다.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);

  if (!EMOTION_TAGS.includes(tag as (typeof EMOTION_TAGS)[number])) notFound();

  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("sentences")
    .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
    .eq("emotion_tag", tag)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  const sentences = (rows ?? []).map(toSentenceCardData);

  const description =
    TAG_DESCRIPTIONS[tag] ?? `'${tag}' 감정이 담긴 문장을 모아봤습니다.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${tag} 문장 모음 — 글적`,
    description,
    url: `${SITE_URL}/tags/${encodeURIComponent(tag)}`,
    isPartOf: { "@type": "WebSite", name: "글적", url: SITE_URL },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "홈",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: `${tag} 문장 모음`,
          item: `${SITE_URL}/tags/${encodeURIComponent(tag)}`,
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

      {/* 태그 네비게이션 */}
      <nav className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {EMOTION_TAGS.map((t) => (
          <Link
            key={t}
            href={`/tags/${encodeURIComponent(t)}`}
            className={`shrink-0 rounded-[var(--radius-pill)] px-3.5 py-1.5 text-xs font-medium transition-colors ${
              t === tag
                ? "bg-archive text-white"
                : "border border-hairline-strong text-stone hover:border-archive hover:text-archive"
            }`}
          >
            {t}
          </Link>
        ))}
      </nav>

      <h1 className="mb-3 font-serif text-2xl font-bold text-ink">
        {tag} 문장 모음
      </h1>

      <p className="mb-8 max-w-xl text-sm leading-relaxed text-stone">
        {description}
      </p>

      {sentences.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {sentences.map((s) => (
            <li key={s.id}>
              <SentenceCard {...s} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-12 text-center text-sm text-stone">
          &lsquo;{tag}&rsquo; 태그의 문장이 아직 없어요.
        </p>
      )}

      <Link
        href="/"
        className="mt-8 inline-block text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 전체 문장 보기
      </Link>
    </main>
  );
}
