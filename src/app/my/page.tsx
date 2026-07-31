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
        <h1 className="font-serif text-xl text-ink">내 보관함</h1>
        {userStreak.streak > 0 ? (
          <span className="border border-archive px-2 py-0.5 font-mono text-xs text-archive">
            {userStreak.streak}일째 필사 중
          </span>
        ) : null}
      </div>

      <section className="flex flex-col gap-3 border border-hairline-strong bg-surface px-6 py-5">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wide text-stone">
            이번 달 요약
          </h2>
          <span className="font-mono text-xs text-stone-faint">
            {formatKstDateDisplay(periodStart)} - {formatKstDateDisplay(now)}
          </span>
        </div>

        {hasActivity ? (
          <div className="flex gap-8">
            <div>
              <p className="font-mono text-xs text-stone">등록한 문장</p>
              <p className="font-serif text-lg text-ink">
                {recap.sentenceCountThisPeriod}개
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-stone">받은 좋아요</p>
              <p className="font-serif text-lg text-ink">{recap.totalLikes}개</p>
            </div>
          </div>
        ) : (
          <p className="font-mono text-sm text-stone">
            이번 달엔 아직 활동이 없어요.
          </p>
        )}

        {recap.topSentence ? (
          <div className="border-l-2 border-archive pl-3">
            <p className="font-mono text-xs text-stone">최고 인기 문장</p>
            <p className="text-ink">{recap.topSentence.body}</p>
          </div>
        ) : null}
      </section>

      <MyArchive sentences={sentences} />

      <div className="mt-4 flex flex-col gap-1">
        <h2 className="font-serif text-lg text-ink">내가 좋아요한 문장</h2>
        <p className="font-mono text-xs text-stone-faint">
          이 기기에서 누른 좋아요만 보여요
        </p>
      </div>
      <LikedSentences />
    </main>
  );
}
