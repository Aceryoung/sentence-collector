import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DailyWordForm } from "./DailyWordForm";

export const metadata: Metadata = {
  title: "오늘의 단어",
  description: "매일 하나의 단어에 대해 자유롭게 생각을 적어보세요.",
};

export default async function DailyWordPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // 오늘의 단어 가져오기
  const { data: dailyWord } = await supabase
    .from("daily_words")
    .select("*")
    .eq("scheduled_date", today)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 내 응답 가져오기
  let myResponse: string | null = null;
  if (user && dailyWord) {
    const { data } = await supabase
      .from("daily_word_responses")
      .select("body")
      .eq("daily_word_id", dailyWord.id)
      .eq("user_id", user.id)
      .single();
    myResponse = data?.body ?? null;
  }

  // 다른 사람들의 응답
  let responses: { id: string; body: string; created_at: string }[] = [];
  if (dailyWord) {
    const { data } = await supabase
      .from("daily_word_responses")
      .select("id, body, created_at")
      .eq("daily_word_id", dailyWord.id)
      .order("created_at", { ascending: false })
      .limit(30);
    responses = data ?? [];
  }

  // 최근 단어 목록 (사이드바용)
  const { data: recentWords } = await supabase
    .from("daily_words")
    .select("id, word, scheduled_date")
    .lte("scheduled_date", today)
    .order("scheduled_date", { ascending: false })
    .limit(7);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      {dailyWord ? (
        <>
          {/* 오늘의 단어 카드 */}
          <section className="mb-8 flex flex-col items-center gap-4 text-center">
            <span className="text-xs font-bold tracking-widest text-coral">
              오늘의 단어
            </span>
            <h1 className="font-serif text-4xl font-bold text-ink sm:text-5xl">
              {dailyWord.word}
            </h1>
            <p className="max-w-md text-xs leading-relaxed text-stone/70">
              단어들은 문장 안에 갇혀 있을 때보다, 이렇게 고립되어 툭 던져졌을 때
              오히려 읽는 이의 내면에 숨겨진 수많은 기억과 감정들을 끌어올리는
              강력한 방아쇠 역할을 합니다.
            </p>
            {dailyWord.description ? (
              <p className="max-w-md text-sm leading-relaxed text-stone">
                {dailyWord.description}
              </p>
            ) : null}
            <time className="text-xs text-stone-faint">
              {new Date(dailyWord.scheduled_date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </section>

          {/* 내 생각 적기 */}
          {user ? (
            <section className="mb-8 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-5">
              <h2 className="mb-3 text-sm font-bold text-ink">
                {myResponse ? "내가 적은 생각" : "내 생각 적기"}
              </h2>
              <DailyWordForm
                dailyWordId={dailyWord.id}
                existingResponse={myResponse}
              />
            </section>
          ) : (
            <div className="mb-8 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-5 text-center">
              <p className="text-sm text-stone">
                <Link href="/login" className="text-archive underline underline-offset-4">
                  로그인
                </Link>
                하고 오늘의 단어에 대한 생각을 남겨보세요.
              </p>
            </div>
          )}

          {/* 다른 사람들의 생각 */}
          <section className="flex flex-col gap-4">
            <h2 className="font-serif text-lg font-bold text-ink">
              사람들의 생각
              {responses.length > 0 ? (
                <span className="ml-2 text-sm font-normal text-stone">
                  {responses.length}
                </span>
              ) : null}
            </h2>

            {responses.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {responses.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4"
                  >
                    <p className="user-text leading-relaxed text-ink">
                      {r.body}
                    </p>
                    <time className="mt-2 block text-xs text-stone-faint">
                      {new Date(r.created_at).toLocaleDateString("ko-KR")}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-stone">
                아직 아무도 생각을 남기지 않았어요. 첫 번째가 되어보세요!
              </p>
            )}
          </section>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <span className="text-4xl">📝</span>
          <h1 className="font-serif text-xl font-bold text-ink">
            오늘의 단어가 아직 없어요
          </h1>
          <p className="text-sm text-stone">
            곧 새로운 단어가 등록됩니다.
          </p>
        </div>
      )}

      {/* 최근 단어 */}
      {recentWords && recentWords.length > 1 ? (
        <section className="mt-10 border-t border-hairline pt-6">
          <h2 className="mb-3 text-sm font-bold text-ink">지난 단어</h2>
          <div className="flex flex-wrap gap-2">
            {recentWords
              .filter((w) => w.scheduled_date !== today)
              .map((w) => (
                <span
                  key={w.id}
                  className="rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1.5 text-xs text-stone"
                >
                  {w.word}
                </span>
              ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
