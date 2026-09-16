import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type WeeklyReportData = {
  practice_days: number;
  total_practices: number;
  top_emotion: string | null;
};

export default async function WeeklyReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase.rpc("get_weekly_report", {
    target_user_id: user.id,
  });

  const report = (data as WeeklyReportData | null) ?? {
    practice_days: 0,
    total_practices: 0,
    top_emotion: null,
  };

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-bold text-ink">주간 리포트</h1>
        <p className="text-sm text-stone">
          {weekStart.toLocaleDateString("ko-KR")} –{" "}
          {now.toLocaleDateString("ko-KR")}
        </p>
      </div>

      {/* 스탯 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center gap-1 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-5 shadow-[var(--shadow-card)]">
          <span className="font-serif text-3xl font-bold text-archive">
            {report.practice_days}
          </span>
          <span className="text-xs text-stone">필사한 날</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-5 shadow-[var(--shadow-card)]">
          <span className="font-serif text-3xl font-bold text-coral">
            {report.total_practices}
          </span>
          <span className="text-xs text-stone">총 필사 수</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-5 shadow-[var(--shadow-card)]">
          <span className="font-serif text-lg font-bold text-ink">
            {report.top_emotion ?? "—"}
          </span>
          <span className="text-xs text-stone">주요 감정</span>
        </div>
      </div>

      {/* 메시지 */}
      <div className="rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
        {report.practice_days >= 5 ? (
          <p className="text-sm leading-relaxed text-ink">
            이번 주 {report.practice_days}일이나 필사했어요! 꾸준한 습관이
            만들어지고 있네요.
          </p>
        ) : report.practice_days >= 3 ? (
          <p className="text-sm leading-relaxed text-ink">
            {report.practice_days}일 필사했어요. 조금만 더 하면 일주일의
            절반을 넘길 수 있어요.
          </p>
        ) : report.practice_days >= 1 ? (
          <p className="text-sm leading-relaxed text-ink">
            이번 주 {report.practice_days}일 필사했어요. 하루에 한 문장,
            습관을 만들어봐요.
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-ink">
            이번 주는 아직 필사를 시작하지 않았어요. 오늘 한 문장 어떨까요?
          </p>
        )}
      </div>

      <Link
        href="/my"
        className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 내 보관함으로
      </Link>
    </main>
  );
}
