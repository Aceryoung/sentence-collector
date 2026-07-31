import { createClient } from "@/lib/supabase/server";
import { getPublicDailyPick } from "@/lib/sentences";
import { getUserStreak } from "@/lib/streak";
import { logPractice } from "./actions";

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const sentence = await getPublicDailyPick(supabase);

  const { streak, completedToday } = user
    ? await getUserStreak(supabase, user.id)
    : { streak: 0, completedToday: false };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center gap-10 px-4 py-16">
      <span className="font-mono text-xs text-stone">오늘의 필사</span>
      {sentence ? (
        <div className="flex flex-col items-center gap-8 text-center">
          <p className="font-serif text-2xl leading-loose text-ink text-balance">
            {sentence.body}
          </p>
          <span className="border border-hairline-strong px-3 py-1 font-mono text-sm text-stone">
            {sentence.source || "출처 미상"}
          </span>

          {user ? (
            <div className="flex flex-col items-center gap-3">
              {streak > 0 ? (
                <span className="border border-archive px-3 py-1 font-mono text-xs text-archive">
                  {streak}일째 필사 중
                </span>
              ) : null}
              {completedToday ? (
                <span className="font-mono text-xs text-stone">
                  오늘의 필사를 완료했어요
                </span>
              ) : (
                <form action={logPractice}>
                  <input type="hidden" name="sentenceId" value={sentence.id} />
                  <button
                    type="submit"
                    className="border-none bg-archive px-4 py-2 font-mono text-sm text-archive-contrast"
                  >
                    필사 완료로 표시
                  </button>
                </form>
              )}
            </div>
          ) : (
            <p className="font-mono text-xs text-stone">
              로그인하면 필사 기록을 스트릭으로 남길 수 있어요
            </p>
          )}
        </div>
      ) : (
        <p className="text-center font-mono text-sm text-stone">
          아직 필사할 문장이 없어요. 첫 문장을 등록해보세요.
        </p>
      )}
    </main>
  );
}
