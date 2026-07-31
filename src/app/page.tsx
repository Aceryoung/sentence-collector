import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SentenceCard } from "@/components/SentenceCard";
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

  const sentences = (data ?? []).map(toSentenceCardData);

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
        <p className="py-16 text-center font-mono text-sm text-stone">
          아직 등록된 문장이 없어요. 가장 먼저 남겨보세요.
        </p>
      )}
    </main>
  );
}
