import { createClient } from "@/lib/supabase/server";
import { SentenceCard } from "@/components/SentenceCard";
import { SENTENCE_WITH_LIKE_COUNT_SELECT, toSentenceCardData } from "@/lib/sentences";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sentences")
    .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
    .order("created_at", { ascending: false })
    .limit(30);

  const sentences = (data ?? []).map(toSentenceCardData);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 py-8">
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
