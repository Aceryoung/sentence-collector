import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SENTENCE_WITH_LIKE_COUNT_SELECT, toSentenceCardData } from "@/lib/sentences";
import { SentenceCard } from "@/components/SentenceCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let sentences: ReturnType<typeof toSentenceCardData>[] = [];

  if (query.length > 0) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("sentences")
      .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
      .is("deleted_at", null)
      .or(`body.ilike.%${query}%,source.ilike.%${query}%,commentary.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(30);

    sentences = (data ?? []).map(toSentenceCardData);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-xl font-bold text-ink">검색</h1>

      <form action="/search" method="get" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="문장, 출처, 감상으로 검색"
          autoFocus
          className="flex-1 rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-stone-faint focus-visible:border-cta focus-visible:shadow-[0_0_0_1px_var(--cta)]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-[var(--radius-pill)] bg-cta px-4 py-2.5 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover"
        >
          검색
        </button>
      </form>

      {query.length > 0 ? (
        sentences.length > 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-stone">
              &lsquo;{query}&rsquo; 검색 결과 {sentences.length}건
            </p>
            <div className="stagger-grid grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sentences.map((s) => (
                <SentenceCard
                  key={s.id}
                  id={s.id}
                  body={s.body}
                  source={s.source}
                  commentary={s.commentary}
                  emotionTag={s.emotionTag}
                  likeCount={s.likeCount}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-stone">
            &lsquo;{query}&rsquo;에 해당하는 문장이 없어요.
          </p>
        )
      ) : (
        <p className="py-8 text-center text-sm text-stone">
          문장 본문, 출처, 감상 내용으로 검색할 수 있어요.
        </p>
      )}

      <Link
        href="/"
        className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 홈으로 돌아가기
      </Link>
    </main>
  );
}
