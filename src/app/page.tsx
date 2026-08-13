import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SentenceCard } from "@/components/SentenceCard";
import { EmptyState } from "@/components/EmptyState";
import { BrandMascot } from "@/components/BrandMascot";
import { TagFilter } from "@/components/TagFilter";
import { MoodPicker } from "@/components/MoodPicker";
import {
  SENTENCE_WITH_LIKE_COUNT_SELECT,
  getPersonalDailyPick,
  toSentenceCardData,
} from "@/lib/sentences";
import { getUserStreak } from "@/lib/streak";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let feedQuery = supabase
    .from("sentences")
    .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
    .is("deleted_at", null);
  if (tag) feedQuery = feedQuery.eq("emotion_tag", tag);
  feedQuery = feedQuery.order("created_at", { ascending: false }).limit(30);

  const [{ data }, dailyPick, userStreak] = await Promise.all([
    feedQuery,
    user ? getPersonalDailyPick(supabase, user.id) : Promise.resolve(null),
    user ? getUserStreak(supabase, user.id) : Promise.resolve(null),
  ]);

  // 다시보기 카드로 이미 위에 노출된 문장은 피드에서 제외
  const sentences = (data ?? [])
    .map(toSentenceCardData)
    .filter((sentence) => sentence.id !== dailyPick?.id);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-8">
      {/* 히어로 섹션 — 슬로건 + 마스코트 */}
      <section className="flex items-center gap-5 rounded-[var(--radius-card)] border border-hairline bg-surface px-6 py-6 shadow-[var(--shadow-card)]">
        <BrandMascot className="hidden h-16 w-[47px] shrink-0 text-archive sm:block" />
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-lg font-bold text-ink sm:text-xl">
            마음에 닿은 문장을 모으다
          </h1>
          <p className="text-sm leading-relaxed text-stone">
            읽고, 쓰고, 필사하며 나만의 문장 아카이브를 만들어보세요.
          </p>
        </div>
      </section>

      {/* 지금 필요한 문장 — 감정 기반 추천 */}
      <MoodPicker />

      {/* 오늘의 필사 CTA — Deep Ink Blue solid */}
      <Link
        href="/practice"
        className="group flex items-center justify-between rounded-[var(--radius-card)] bg-cta px-5 py-3.5 transition-colors hover:bg-cta-hover"
      >
        <span className="text-sm font-bold text-cta-contrast">
          오늘의 필사 보러가기 →
        </span>
        {userStreak && userStreak.streak > 0 ? (
          <span className="rounded-[var(--radius-pill)] bg-cta-contrast/15 px-2.5 py-0.5 text-xs font-bold text-cta-contrast">
            🔥 {userStreak.streak}일째
          </span>
        ) : null}
      </Link>

      {/* 오늘 다시 보는 문장 — 큐레이션 */}
      {dailyPick && (
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-hairline" />
            <span className="text-xs font-bold uppercase tracking-widest text-coral">
              오늘 다시 보는 문장
            </span>
            <span className="h-px flex-1 bg-hairline" />
          </div>
          <SentenceCard
            id={dailyPick.id}
            body={dailyPick.body}
            source={dailyPick.source}
            commentary={dailyPick.commentary}
            emotionTag={dailyPick.emotionTag}
            likeCount={dailyPick.likeCount}
          />
        </section>
      )}

      {/* 발견하기 — 문장 피드 */}
      {sentences.length > 0 || tag ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone">
            발견하기
          </h2>
          <TagFilter activeTag={tag ?? null} />
          {sentences.length > 0 ? (
            sentences.map((sentence) => (
              <SentenceCard
                key={sentence.id}
                id={sentence.id}
                body={sentence.body}
                source={sentence.source}
                commentary={sentence.commentary}
                emotionTag={sentence.emotionTag}
                likeCount={sentence.likeCount}
              />
            ))
          ) : (
            <p className="py-6 text-center text-sm text-stone">
              &lsquo;{tag}&rsquo; 태그의 문장이 아직 없어요.
            </p>
          )}
        </section>
      ) : (
        <EmptyState
          withMascot
          message="아직 등록된 문장이 없어요."
          action={
            <Link
              href="/write"
              className="rounded-[var(--radius-pill)] bg-cta px-5 py-2.5 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover"
            >
              첫 문장 남기기
            </Link>
          }
        />
      )}
    </main>
  );
}
