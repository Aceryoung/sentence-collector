import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SentenceCard } from "@/components/SentenceCard";
import { EmptyState } from "@/components/EmptyState";
import {
  SENTENCE_WITH_LIKE_COUNT_SELECT,
  getPersonalDailyPick,
  toSentenceCardData,
} from "@/lib/sentences";
import { getUserStreak } from "@/lib/streak";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data }, dailyPick, userStreak] = await Promise.all([
    supabase
      .from("sentences")
      .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
      .order("created_at", { ascending: false })
      .limit(30),
    user ? getPersonalDailyPick(supabase, user.id) : Promise.resolve(null),
    user ? getUserStreak(supabase, user.id) : Promise.resolve(null),
  ]);

  // 다시보기 카드로 이미 위에 노출된 문장은 피드에서 제외 — 같은 카드가 한 화면에
  // 두 번 보이는 중복을 없앤다.
  const sentences = (data ?? [])
    .map(toSentenceCardData)
    .filter((sentence) => sentence.id !== dailyPick?.id);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 py-8">
      {dailyPick && (
        <section className="flex flex-col gap-2">
          <span className="font-mono text-xs text-archive">
            오늘 다시 보는 문장
          </span>
          <SentenceCard
            id={dailyPick.id}
            body={dailyPick.body}
            source={dailyPick.source}
            likeCount={dailyPick.likeCount}
          />
        </section>
      )}
      <Link
        href="/practice"
        className="flex items-center justify-between border border-hairline-strong bg-surface px-4 py-3 transition-colors hover:border-archive"
      >
        <span className="font-mono text-sm text-ink">오늘의 필사 보러가기 →</span>
        {userStreak && userStreak.streak > 0 ? (
          <span className="border border-archive px-2 py-0.5 font-mono text-xs text-archive">
            {userStreak.streak}일째
          </span>
        ) : null}
      </Link>
      {sentences.length > 0 ? (
        sentences.map((sentence) => (
          <SentenceCard
            key={sentence.id}
            id={sentence.id}
            body={sentence.body}
            source={sentence.source}
            likeCount={sentence.likeCount}
          />
        ))
      ) : (
        <EmptyState
          withMascot
          message="아직 등록된 문장이 없어요."
          action={
            <Link
              href="/write"
              className="bg-archive px-4 py-2 font-mono text-sm text-archive-contrast"
            >
              첫 문장 남기기
            </Link>
          }
        />
      )}
    </main>
  );
}
