import { createClient } from "@/lib/supabase/server";
import { getPublicDailyPick } from "@/lib/sentences";
import { getUserStreak } from "@/lib/streak";
import { BrandMascot } from "@/components/BrandMascot";
import { PracticeCompleteButton } from "./PracticeCompleteButton";
import { TypingPractice } from "./TypingPractice";
import { EmptyState } from "@/components/EmptyState";

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
      <span className="text-xs font-bold uppercase tracking-widest text-coral">
        오늘의 필사
      </span>
      {sentence ? (
        <div className="flex w-full flex-col items-center gap-8 text-center">
          {/* 문장 카드 — 종이 질감 강조 */}
          <div className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-8 py-10 shadow-[var(--shadow-card)]">
            <p className="user-text font-serif text-2xl leading-loose text-ink">
              {sentence.body}
            </p>
          </div>
          <span className="max-w-full rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1 text-sm break-words text-stone">
            {sentence.source || "출처 미상"}
          </span>

          {user ? (
            <div className="flex flex-col items-center gap-4">
              {/* 잉크 진행률 인디케이터 */}
              {streak > 0 ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-coral">
                      🔥 {streak}일째 필사 중
                    </span>
                  </div>
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-hairline">
                    <div
                      className="ink-progress-bar h-full rounded-full"
                      style={{
                        backgroundPosition: `${100 - Math.min(100, (streak / 30) * 100)}% center`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-faint">
                    30일 목표
                  </span>
                </div>
              ) : null}
              {completedToday ? (
                <div className="flex flex-col items-center gap-2">
                  <BrandMascot className="h-10 w-[29px] text-archive" />
                  <span className="text-sm text-archive">
                    오늘의 필사를 완료했어요 ✨
                  </span>
                </div>
              ) : (
                <div className="flex w-full flex-col gap-6">
                  <TypingPractice
                    sentenceId={sentence.id}
                    originalText={sentence.body}
                  />
                  <div className="flex items-center gap-2">
                    <span className="h-px flex-1 bg-hairline" />
                    <span className="text-xs text-stone-faint">또는</span>
                    <span className="h-px flex-1 bg-hairline" />
                  </div>
                  <PracticeCompleteButton sentenceId={sentence.id} />
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-stone">
              로그인하면 필사 기록을 스트릭으로 남길 수 있어요
            </p>
          )}
        </div>
      ) : (
        <EmptyState
          withMascot
          message="아직 필사할 문장이 없어요. 첫 문장을 등록해보세요."
        />
      )}
    </main>
  );
}
