import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SENTENCE_WITH_LIKE_COUNT_SELECT, toSentenceCardData } from "@/lib/sentences";
import { LikeButton } from "@/components/LikeButton";
import { ShareImageButton } from "@/components/ShareImageButton";
import { ReflectionForm } from "./ReflectionForm";
import { ThoughtSection } from "./ThoughtSection";
import { ReflectionLikeButton } from "@/components/ReflectionLikeButton";
import { AddToCollectionButton } from "@/components/AddToCollectionButton";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sentence-collector-zeta.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("sentences")
    .select("body, source")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!data) return { title: "문장을 찾을 수 없습니다" };

  const preview = data.body.length > 80 ? data.body.slice(0, 80) + "…" : data.body;
  const title = data.source ? `${preview} — ${data.source}` : preview;

  return {
    title,
    description: data.body,
    openGraph: {
      title,
      description: data.body,
      type: "article",
    },
  };
}

export default async function SentenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: raw } = await supabase
    .from("sentences")
    .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!raw) notFound();

  const sentence = toSentenceCardData(raw);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비공개 내 생각 — 로그인 사용자 본인 것만 (RLS가 보장)
  const { data: thoughts } = user
    ? await supabase
        .from("thoughts")
        .select("id, body, created_at, updated_at")
        .eq("sentence_id", id)
        .order("created_at", { ascending: false })
    : { data: null };

  const { data: reflections } = await supabase
    .from("reflections")
    .select("id, body, created_at, reflection_likes(count)")
    .eq("sentence_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  // 로그인 사용자의 감상 좋아요 상태
  let likedReflectionIds = new Set<string>();
  if (user && reflections && reflections.length > 0) {
    const { data: myLikes } = await supabase
      .from("reflection_likes")
      .select("reflection_id")
      .eq("user_id", user.id)
      .in("reflection_id", reflections.map((r) => r.id));
    if (myLikes) {
      likedReflectionIds = new Set(myLikes.map((l) => l.reflection_id));
    }
  }

  // 같은 태그의 관련 문장 (최대 4개)
  let relatedSentences: { id: string; body: string; source: string | null }[] = [];
  if (sentence.emotionTag) {
    const { data: related } = await supabase
      .from("sentences")
      .select("id, body, source")
      .eq("emotion_tag", sentence.emotionTag)
      .neq("id", id)
      .is("deleted_at", null)
      .limit(4);
    relatedSentences = related ?? [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quotation",
    text: sentence.body,
    ...(sentence.source ? { creator: { "@type": "Person", name: sentence.source } } : {}),
    isPartOf: { "@type": "WebSite", name: "글적", url: SITE_URL },
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:gap-10 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── 왼쪽: 메인 콘텐츠 ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-8 lg:max-w-4xl">
      {/* 문장 본문 — 큰 화면 감상 */}
      <section className="animate-fade-up flex flex-col items-center gap-6 text-center">
        <p className="user-text font-serif text-2xl leading-loose font-semibold text-ink sm:text-3xl">
          {sentence.body}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1 text-sm text-stone">
            {sentence.source || "출처 미상"}
          </span>
          {sentence.emotionTag ? (
            <span className="rounded-[var(--radius-pill)] bg-archive/10 px-2.5 py-0.5 text-xs text-archive">
              {sentence.emotionTag}
            </span>
          ) : null}
        </div>

        {sentence.commentary ? (
          <p className="max-w-md italic leading-relaxed text-stone">
            {sentence.commentary}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <LikeButton sentenceId={sentence.id} initialCount={sentence.likeCount} />
          <ShareImageButton body={sentence.body} source={sentence.source} />
          {user ? <AddToCollectionButton sentenceId={sentence.id} /> : null}
        </div>
      </section>

      {/* 내 생각 — 비공개, 로그인 사용자만 */}
      {user ? (
        <>
          <hr className="border-hairline" />
          <ThoughtSection sentenceId={id} thoughts={thoughts ?? []} />
        </>
      ) : null}

      <hr className="border-hairline" />

      {/* 감상 목록 */}
      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-lg font-bold text-ink">
          감상
          {reflections && reflections.length > 0 ? (
            <span className="ml-2 text-sm font-normal text-stone">
              {reflections.length}
            </span>
          ) : null}
        </h2>

        {reflections && reflections.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {reflections.map((r) => (
              <li
                key={r.id}
                className="rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4"
              >
                <p className="user-text leading-relaxed text-ink">
                  {r.body}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <time className="text-xs text-stone-faint">
                    {new Date(r.created_at).toLocaleDateString("ko-KR")}
                  </time>
                  {user ? (
                    <ReflectionLikeButton
                      reflectionId={r.id}
                      sentenceId={id}
                      liked={likedReflectionIds.has(r.id)}
                      count={
                        (r as unknown as { reflection_likes: { count: number }[] })
                          .reflection_likes?.[0]?.count ?? 0
                      }
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-stone">
            아직 감상이 없어요. 첫 감상을 남겨보세요.
          </p>
        )}

        {user ? (
          <ReflectionForm sentenceId={id} />
        ) : (
          <Link
            href="/login"
            className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
          >
            로그인하고 감상 남기기
          </Link>
        )}
      </section>

      <Link
        href="/"
        className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 목록으로 돌아가기
      </Link>
      </div>

      {/* ── 오른쪽: 관련 문장 사이드바 (데스크탑) ── */}
      {relatedSentences.length > 0 ? (
        <aside className="hidden shrink-0 lg:sticky lg:top-20 lg:flex lg:w-72 lg:flex-col lg:gap-4 lg:self-start">
          <h2 className="font-serif text-sm font-bold text-ink">
            같은 감정의 문장
          </h2>
          {relatedSentences.map((r) => (
            <Link
              key={r.id}
              href={`/sentences/${r.id}`}
              className="card-lift flex flex-col gap-2 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-3 transition-all hover:border-archive/40 hover:shadow-[var(--shadow-card-hover)]"
            >
              <p className="user-text line-clamp-2 text-sm leading-relaxed text-ink">
                {r.body}
              </p>
              <span className="text-xs text-stone-faint">
                {r.source || "출처 미상"}
              </span>
            </Link>
          ))}
        </aside>
      ) : null}
    </main>
  );
}
