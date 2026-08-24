import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SENTENCE_WITH_LIKE_COUNT_SELECT, toSentenceCardData } from "@/lib/sentences";
import { getMonthlyRecap } from "@/lib/recap";
import { getUserStreak } from "@/lib/streak";
import { MyArchive } from "./MyArchive";
import { MyThoughts } from "./MyThoughts";
import { MyLibraryTabsClient } from "./MyLibraryTabsClient";
import type { JourneyData } from "./MyJourney";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

  const [
    { data },
    { data: myThoughts },
    recap,
    userStreak,
    { count: reflectionCount },
    { data: practiceRows },
    { data: sentenceRows },
    { data: typingHistory },
  ] = await Promise.all([
    supabase
      .from("sentences")
      .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
      .eq("author_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("thoughts")
      .select("id, body, created_at, sentences(id, body)")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    getMonthlyRecap(supabase, user.id, now),
    getUserStreak(supabase, user.id, now),
    // 여정 데이터
    supabase
      .from("reflections")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id),
    supabase
      .from("practice_logs")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", ninetyDaysAgo.toISOString().slice(0, 10)),
    supabase
      .from("sentences")
      .select("created_at")
      .eq("author_id", user.id)
      .is("deleted_at", null)
      .gte("created_at", ninetyDaysAgo.toISOString()),
    supabase
      .from("practice_logs")
      .select("date, accuracy, duration_seconds, sentences(body)")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(10),
  ]);

  const sentences = (data ?? []).map(toSentenceCardData);

  // 히트맵 데이터 생성
  const activityMap: Record<string, number> = {};
  for (const row of practiceRows ?? []) {
    const d = row.date as string;
    activityMap[d] = (activityMap[d] ?? 0) + 1;
  }
  for (const row of sentenceRows ?? []) {
    const d = (row.created_at as string).slice(0, 10);
    activityMap[d] = (activityMap[d] ?? 0) + 1;
  }

  // 총 좋아요 (내 문장에 달린)
  const { data: likeData } = await supabase
    .from("sentences")
    .select("likes(count)")
    .eq("author_id", user.id)
    .is("deleted_at", null);

  const totalLikes = (likeData ?? []).reduce(
    (sum, row) => {
      const likes = row.likes as { count: number }[] | null;
      return sum + (likes?.[0]?.count ?? 0);
    },
    0,
  );

  const journeyData: JourneyData = {
    sentenceCount: sentences.length,
    reflectionCount: reflectionCount ?? 0,
    totalLikes,
    streak: userStreak.streak,
    activityMap,
    typingHistory: (typingHistory ?? []).map((log) => {
      const sentence = Array.isArray(log.sentences)
        ? log.sentences[0]
        : log.sentences;
      return {
        date: log.date as string,
        accuracy: log.accuracy as number | null,
        duration_seconds: log.duration_seconds as number | null,
        sentenceBody: (sentence as { body: string } | null)?.body ?? null,
      };
    }),
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 — 타이틀 + 스탯 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-bold text-ink">내 보관함</h1>
          <p className="text-sm text-stone">
            수집한 문장과 감상, 영감의 순간들을 모아두는 곳.
          </p>
        </div>

        {/* 스탯 카드 */}
        <div className="flex gap-3">
          <div className="card-lift flex items-center gap-2.5 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-3 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-archive">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold tracking-wide text-stone">수집</span>
              <span className="font-serif text-xl font-bold text-ink">{sentences.length}</span>
            </div>
          </div>
          <div className="card-lift flex items-center gap-2.5 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-3 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold tracking-wide text-stone">연속 필사</span>
              <span className="font-serif text-xl font-bold text-ink">{userStreak.streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 기반 콘텐츠 */}
      <MyLibraryTabsClient
        sentences={sentences}
        myThoughts={(myThoughts ?? []).map((t) => ({
          ...t,
          sentences: Array.isArray(t.sentences) ? t.sentences[0] ?? null : t.sentences,
        }))}
        recap={recap}
        journeyData={journeyData}
      />

      {/* 하단 링크 */}
      <div className="mt-4 flex flex-col gap-3">
        <Link
          href="/settings"
          className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
        >
          계정 설정 →
        </Link>
      </div>
    </main>
  );
}
