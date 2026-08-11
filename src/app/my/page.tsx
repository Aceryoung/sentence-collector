import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SENTENCE_WITH_LIKE_COUNT_SELECT, toSentenceCardData } from "@/lib/sentences";
import { getMonthlyRecap } from "@/lib/recap";
import { getPeriodStart } from "@/lib/ranking";
import { formatKstDateDisplay } from "@/lib/kst-date";
import { getUserStreak } from "@/lib/streak";
import { MyArchive } from "./MyArchive";
import { LikedSentences } from "./LikedSentences";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("sentences")
    .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const sentences = (data ?? []).map(toSentenceCardData);

  const now = new Date();
  const [recap, userStreak] = await Promise.all([
    getMonthlyRecap(supabase, user.id, now),
    getUserStreak(supabase, user.id, now),
  ]);
  const periodStart = getPeriodStart("month", now);
  const hasActivity = recap.sentenceCountThisPeriod > 0 || recap.totalLikes > 0;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold text-ink">내 보관함</h1>
        {userStreak.streak > 0 ? (
          <span className="rounded-[var(--radius-pill)] border border-archive px-2.5 py-0.5 text-xs text-archive">
            {userStreak.streak}일째 필사 중
          </span>
        ) : null}
      </div>

      <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-6 py-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone">
            이번 달 요약
          </h2>
          <span className="text-xs text-stone-faint">
            {formatKstDateDisplay(periodStart)} - {formatKstDateDisplay(now)}
          </span>
        </div>

        {hasActivity ? (
          <div className="flex gap-8">
            <div>
              <p className="text-xs text-stone">등록한 문장</p>
              <p className="font-serif text-lg text-ink">
                {recap.sentenceCountThisPeriod}개
              </p>
            </div>
            <div>
              <p className="text-xs text-stone">받은 좋아요</p>
              <p className="font-serif text-lg text-ink">{recap.totalLikes}개</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone">
            이번 달엔 아직 활동이 없어요.
          </p>
        )}

        {recap.topSentence ? (
          <div className="rounded-[var(--radius-input)] border-l-2 border-archive pl-3">
            <p className="text-xs text-stone">최고 인기 문장</p>
            <p className="user-text text-ink">{recap.topSentence.body}</p>
          </div>
        ) : null}
      </section>

      <MyArchive sentences={sentences} />

      <div className="mt-4 flex flex-col gap-1">
        <h2 className="font-serif text-lg font-bold text-ink">내가 좋아요한 문장</h2>
        <p className="text-xs text-stone-faint">
          이 기기에서 누른 좋아요만 보여요
        </p>
      </div>
      <LikedSentences />

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/my/journey"
          className="group flex items-center justify-between rounded-[var(--radius-card)] border border-coral/20 bg-coral-soft px-5 py-3.5 transition-all hover:border-coral/40 hover:shadow-[var(--shadow-card)]"
        >
          <span className="text-sm font-bold text-ink">나의 여정 — 통계 및 성취</span>
          <span className="text-coral transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
        <Link
          href="/settings"
          className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
        >
          계정 설정 (비밀번호) →
        </Link>
      </div>
    </main>
  );
}
