import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/EmptyState";
import { BrandMascot } from "@/components/BrandMascot";
import { TagFilter } from "@/components/TagFilter";
import { InfiniteScrollFeed } from "@/components/InfiniteScrollFeed";
import {
  SENTENCE_WITH_LIKE_COUNT_SELECT,
  getPersonalDailyPick,
  toSentenceCardData,
} from "@/lib/sentences";
import { getUserStreak } from "@/lib/streak";
import { getLeaderboard } from "@/lib/leaderboard";
import { PracticeLeaderboard } from "@/components/PracticeLeaderboard";
import { DomainChallenge } from "@/components/DomainChallenge";
import { getPersonalizedRecommendations } from "@/lib/personalization";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const PAGE_SIZE = 20;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let feedQuery = supabase
    .from("sentences")
    .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
    .is("deleted_at", null);
  if (tag) feedQuery = feedQuery.eq("emotion_tag", tag);
  feedQuery = feedQuery
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE);

  const [{ data }, dailyPick, userStreak, leaderboard, recommendations, { count: totalSentences }] = await Promise.all([
    feedQuery,
    user ? getPersonalDailyPick(supabase, user.id) : Promise.resolve(null),
    user ? getUserStreak(supabase, user.id) : Promise.resolve(null),
    getLeaderboard(supabase, user?.id ?? null),
    user
      ? getPersonalizedRecommendations(supabase, user.id)
      : Promise.resolve(null),
    supabase
      .from("sentences")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
  ]);

  const sentences = (data ?? [])
    .map(toSentenceCardData)
    .filter((sentence) => sentence.id !== dailyPick?.id);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* 서비스 소개 — AI 인용 가능한 정의 블록 (SEO/GEO) */}
      {!user && !tag ? (
        <section className="mb-8 rounded-[var(--radius-card)] border border-hairline bg-surface px-6 py-8 text-center sm:px-10">
          <h2 className="mb-4 font-serif text-xl font-bold text-ink sm:text-2xl">
            글적이란?
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-stone sm:text-base">
            글적은 마음에 닿은 문장을 모으고, 직접 필사하며, 감상을 나누는 문장 아카이브 서비스입니다.
            책, 영화, 노래 가사, 시 등에서 발견한 좋은 문장을 기록하고,
            매일 한 문장을 천천히 따라 쓰는 필사 연습으로 글쓰기 습관을 기를 수 있습니다.
            위로, 동기부여, 사랑, 깨달음 등 감정 태그로 문장을 분류하고,
            다른 사용자의 감상을 읽으며 같은 문장에서 서로 다른 울림을 발견할 수 있습니다.
            연속 필사 기록과 챌린지 참여로 꾸준한 독서·글쓰기 습관을 만들어보세요.
          </p>
        </section>
      ) : null}

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">

        {/* ── 왼쪽 사이드바 (데스크탑) / 상단 (모바일) ── */}
        <aside aria-label="추천 및 바로가기" className="flex shrink-0 flex-col gap-5 lg:sticky lg:top-20 lg:w-80 lg:self-start">

          {/* 마스코트 인사 */}
          <div className="animate-fade-up flex items-center gap-4">
            <BrandMascot className="h-14 w-[41px] shrink-0 text-archive" />
            <p className="font-serif text-sm leading-relaxed text-ink">
              마음에 닿은 문장을 모으고,
              <br />
              나만의 아카이브를 만들어보세요.
            </p>
          </div>

          {/* 오늘 다시 보는 문장 — 피처드 (로그인 시) */}
          {dailyPick ? (
            <section className="animate-fade-up flex flex-col gap-3" style={{ animationDelay: '50ms' }}>
              <span className="text-xs font-bold tracking-widest text-coral">
                오늘 다시 보는 문장
              </span>
              <Link
                href={`/sentences/${dailyPick.id}`}
                className="card-lift group flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-6 py-6 shadow-[var(--shadow-card)] hover:border-archive/40 hover:shadow-[var(--shadow-card-hover)]"
              >
                <p className="user-text font-serif text-lg leading-relaxed font-semibold text-ink">
                  {dailyPick.body}
                </p>
                {dailyPick.commentary ? (
                  <p className="user-text line-clamp-2 text-sm italic text-stone">
                    {dailyPick.commentary}
                  </p>
                ) : null}
                <span className="mt-1 self-start rounded-[var(--radius-pill)] border border-hairline-strong px-2.5 py-0.5 text-xs text-stone">
                  {dailyPick.source || "출처 미상"}
                </span>
              </Link>
            </section>
          ) : null}

          {/* 비로그인 시 문장 등록 유도 */}
          {!user ? (
            <Link
              href="/login"
              className="card-lift animate-fade-up flex flex-col gap-2 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 transition-all hover:border-archive/40 hover:shadow-[var(--shadow-card-hover)]"
              style={{ animationDelay: '50ms' }}
            >
              <span className="text-xs font-bold text-archive">나만의 아카이브</span>
              <p className="text-sm leading-relaxed text-stone">
                로그인하고 마음에 드는 문장을 저장하고, 감상을 남겨보세요.
              </p>
            </Link>
          ) : null}

          {/* 오늘의 필사 CTA */}
          <Link
            href="/practice"
            className="btn-press card-lift animate-fade-up group flex items-center justify-between rounded-[var(--radius-card)] bg-cta px-5 py-4 hover:bg-cta-hover hover:shadow-lg"
            style={{ animationDelay: '100ms' }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-cta-contrast">
                오늘의 필사
              </span>
              <span className="text-xs text-cta-contrast/70">
                한 문장을 천천히 따라 써보세요
              </span>
            </div>
            <div className="flex items-center gap-2">
              {userStreak && userStreak.streak > 0 ? (
                <span className="rounded-[var(--radius-pill)] bg-cta-contrast/15 px-2.5 py-0.5 text-xs font-bold tabular-nums text-cta-contrast">
                  {userStreak.streak}일째
                </span>
              ) : null}
              <span className="text-cta-contrast/60 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </div>
          </Link>

          {/* 필사 챌린지 순위 */}
          <PracticeLeaderboard entries={leaderboard} />

          {/* 도메인 챌린지 */}
          <DomainChallenge currentCount={totalSentences ?? 0} />
        </aside>

        {/* ── 오른쪽 메인 피드 ── */}
        <div className="min-w-0 flex-1">
          {/* 맞춤 추천 (로그인 시) */}
          {recommendations && recommendations.sentences.length > 0 && !tag ? (
            <section className="mb-6 flex flex-col gap-3">
              <span className="text-xs font-bold tracking-widest text-coral">
                {recommendations.reason}
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {recommendations.sentences.map((s) => (
                  <Link
                    key={s.id}
                    href={`/sentences/${s.id}`}
                    className="card-lift flex flex-col gap-2 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-4 shadow-[var(--shadow-card)] hover:border-archive/40 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <p className="user-text line-clamp-3 font-serif text-sm leading-relaxed text-ink">
                      {s.body}
                    </p>
                    <span className="text-[10px] text-stone">
                      {s.source || "출처 미상"}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {sentences.length > 0 || tag ? (
            <section aria-label="문장 피드" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="font-serif text-lg font-bold text-ink">
                  발견하기
                </h1>
                {!user ? (
                  <Link
                    href="/login"
                    className="rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1.5 text-xs font-medium text-stone transition-all duration-200 hover:border-archive hover:text-archive active:scale-95"
                  >
                    + 문장 남기기
                  </Link>
                ) : null}
              </div>
              <TagFilter activeTag={tag ?? null} />
              {sentences.length > 0 ? (
                <InfiniteScrollFeed
                  initialSentences={sentences}
                  tag={tag}
                  excludeId={dailyPick?.id}
                  initialHasMore={sentences.length >= PAGE_SIZE}
                />
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
                  className="rounded-[var(--radius-pill)] bg-cta px-5 py-2.5 text-sm font-bold text-cta-contrast transition-all duration-200 hover:bg-cta-hover hover:shadow-md"
                >
                  첫 문장 남기기
                </Link>
              }
            />
          )}
        </div>

      </div>
    </main>
  );
}
