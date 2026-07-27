import { createClient } from "@/lib/supabase/server";
import { SentenceCard } from "@/components/SentenceCard";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: sentences } = await supabase
    .from("sentences")
    .select("id, body, source, created_at, likes(count)")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 py-8">
      {sentences && sentences.length > 0 ? (
        sentences.map((sentence) => (
          <SentenceCard
            key={sentence.id}
            body={sentence.body}
            source={sentence.source}
            likeCount={sentence.likes?.[0]?.count ?? 0}
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
