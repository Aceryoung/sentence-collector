import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SentenceCard } from "@/components/SentenceCard";
import {
  SENTENCE_WITH_LIKE_COUNT_SELECT,
  getPersonalDailyPick,
  toSentenceCardData,
} from "@/lib/sentences";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data }, dailyPick] = await Promise.all([
    supabase
      .from("sentences")
      .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
      .order("created_at", { ascending: false })
      .limit(30),
    user ? getPersonalDailyPick(supabase, user.id) : Promise.resolve(null),
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
            body={dailyPick.body}
            source={dailyPick.source}
            likeCount={dailyPick.likeCount}
          />
        </section>
      )}
      <Link
        href="/practice"
        className="self-end font-mono text-xs text-stone hover:text-ink"
      >
        오늘의 필사 보러가기 →
      </Link>
      {sentences.length > 0 ? (
        sentences.map((sentence) => (
          <SentenceCard
            key={sentence.id}
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
