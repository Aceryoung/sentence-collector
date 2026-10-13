import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import { AdminSentenceList } from "./AdminSentenceList";
import { AdminDailyWords } from "./AdminDailyWords";
import { AdminFeedbackList } from "./AdminFeedbackList";
import { AdminSns } from "./AdminSns";
import { AdminKpi } from "./AdminKpi";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string; q?: string; deleted?: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect("/");

  const { tab = "dashboard", page = "1", q = "", deleted } = await searchParams;
  const supabase = await createClient();

  // ── 통계 ──
  const [
    { count: sentenceCount },
    { count: userCount },
    { count: likeCount },
    { count: practiceCount },
    { count: reflectionCount },
    { count: followCount },
    { count: collectionCount },
    { count: challengeCount },
  ] = await Promise.all([
    supabase.from("sentences").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("user_settings").select("*", { count: "exact", head: true }),
    supabase.from("likes").select("*", { count: "exact", head: true }),
    supabase.from("practice_logs").select("*", { count: "exact", head: true }),
    supabase.from("reflections").select("*", { count: "exact", head: true }),
    supabase.from("follows").select("*", { count: "exact", head: true }),
    supabase.from("collections").select("*", { count: "exact", head: true }),
    supabase.from("challenges").select("*", { count: "exact", head: true }),
  ]);

  // ── KPI ──
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: newSentencesThisMonth },
    { data: newSentencesLastMonth },
    { data: wauSentences },
    { data: wauPractice },
    { data: wauReflections },
    { data: prevWauSentences },
    { data: prevWauPractice },
    { data: prevWauReflections },
    { count: monthlyNewUsers },
    { count: lastMonthNewUsers },
  ] = await Promise.all([
    supabase.from("sentences").select("author_id").is("deleted_at", null).gte("created_at", thisMonthStart),
    supabase.from("sentences").select("author_id").is("deleted_at", null).gte("created_at", lastMonthStart).lte("created_at", lastMonthEnd),
    supabase.from("sentences").select("author_id").is("deleted_at", null).gte("created_at", oneWeekAgo),
    supabase.from("practice_logs").select("user_id").gte("date", oneWeekAgo.slice(0, 10)),
    supabase.from("reflections").select("author_id").gte("created_at", oneWeekAgo),
    supabase.from("sentences").select("author_id").is("deleted_at", null).gte("created_at", twoWeeksAgo).lt("created_at", oneWeekAgo),
    supabase.from("practice_logs").select("user_id").gte("date", twoWeeksAgo.slice(0, 10)).lt("date", oneWeekAgo.slice(0, 10)),
    supabase.from("reflections").select("author_id").gte("created_at", twoWeeksAgo).lt("created_at", oneWeekAgo),
    supabase.from("user_settings").select("*", { count: "exact", head: true }).gte("created_at", thisMonthStart),
    supabase.from("user_settings").select("*", { count: "exact", head: true }).gte("created_at", lastMonthStart).lte("created_at", lastMonthEnd),
  ]);

  const wauSet = new Set<string>();
  for (const r of wauSentences ?? []) wauSet.add(r.author_id as string);
  for (const r of wauPractice ?? []) wauSet.add(r.user_id as string);
  for (const r of wauReflections ?? []) wauSet.add(r.author_id as string);
  const wau = wauSet.size;

  const prevWauSet = new Set<string>();
  for (const r of prevWauSentences ?? []) prevWauSet.add(r.author_id as string);
  for (const r of prevWauPractice ?? []) prevWauSet.add(r.user_id as string);
  for (const r of prevWauReflections ?? []) prevWauSet.add(r.author_id as string);
  const prevWau = prevWauSet.size;

  const wauChange = prevWau > 0 ? Math.round(((wau - prevWau) / prevWau) * 100) : null;

  const monthlySentences = new Set((newSentencesThisMonth ?? []).map((r) => r.author_id as string)).size;
  const lastMonthlySentences = new Set((newSentencesLastMonth ?? []).map((r) => r.author_id as string)).size;

  const monthlyUsersVal = monthlyNewUsers ?? 0;
  const lastMonthUsersVal = lastMonthNewUsers ?? 0;
  const monthlyUsersChange = lastMonthUsersVal > 0 ? Math.round(((monthlyUsersVal - lastMonthUsersVal) / lastMonthUsersVal) * 100) : null;

  const sentenceCountThisMonth = (newSentencesThisMonth ?? []).length;
  const sentenceCountLastMonth = (newSentencesLastMonth ?? []).length;
  const sentenceChange = sentenceCountLastMonth > 0 ? Math.round(((sentenceCountThisMonth - sentenceCountLastMonth) / sentenceCountLastMonth) * 100) : null;

  const kpiItems = [
    {
      label: "월간 신규 가입",
      value: monthlyUsersVal,
      change: monthlyUsersChange,
      note: `지난달 ${lastMonthUsersVal}명`,
    },
    {
      label: "주간 활성 사용자 (WAU)",
      value: wau,
      change: wauChange,
      note: `지난주 ${prevWau}명`,
    },
    {
      label: "총 문장 수",
      value: sentenceCount ?? 0,
      target: 500,
      note: `이번달 +${sentenceCountThisMonth}`,
    },
    {
      label: "이번달 활동 작성자",
      value: monthlySentences,
      change: lastMonthlySentences > 0 ? Math.round(((monthlySentences - lastMonthlySentences) / lastMonthlySentences) * 100) : null,
      note: `지난달 ${lastMonthlySentences}명`,
    },
  ];

  // ── 문장 관리 ──
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const PAGE_SIZE = 20;
  const offset = (pageNum - 1) * PAGE_SIZE;

  let sentenceQuery = supabase
    .from("sentences")
    .select("id, body, source, emotion_tag, created_at, deleted_at, author_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (deleted === "true") {
    sentenceQuery = sentenceQuery.not("deleted_at", "is", null);
  } else {
    sentenceQuery = sentenceQuery.is("deleted_at", null);
  }

  if (q) {
    sentenceQuery = sentenceQuery.ilike("body", `%${q}%`);
  }

  const { data: sentences, count: totalSentences } = await sentenceQuery;
  const totalPages = Math.ceil((totalSentences ?? 0) / PAGE_SIZE);

  // ── 오늘의 단어 ──
  const { data: dailyWords } = await supabase
    .from("daily_words")
    .select("id, word, description, scheduled_date")
    .order("scheduled_date", { ascending: false })
    .limit(50);

  const todayStr = now.toISOString().split("T")[0];
  const todayDailyWord = (dailyWords ?? []).find((w) => w.scheduled_date === todayStr) ?? null;

  // ── SNS 인기 문장 (최근 7일) ──
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: snsSentences } = await supabase
    .from("sentences")
    .select("id, body, source, created_at, likes(count)")
    .is("deleted_at", null)
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: false })
    .limit(50);

  const snsRanked = (snsSentences ?? [])
    .map((s) => ({
      id: s.id as string,
      body: s.body as string,
      source: s.source as string | null,
      likeCount: (s.likes as { count: number }[])?.[0]?.count ?? 0,
      createdAt: s.created_at as string,
    }))
    .filter((s) => s.likeCount > 0)
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 5);

  // ── 피드백 ──
  const { data: feedbackItems } = await supabase
    .from("feedback")
    .select("id, category, body, page_url, created_at, resolved")
    .order("created_at", { ascending: false })
    .limit(100);

  const stats = [
    { label: "문장", value: sentenceCount ?? 0 },
    { label: "사용자", value: userCount ?? 0 },
    { label: "좋아요", value: likeCount ?? 0 },
    { label: "필사", value: practiceCount ?? 0 },
    { label: "감상", value: reflectionCount ?? 0 },
    { label: "팔로우", value: followCount ?? 0 },
    { label: "컬렉션", value: collectionCount ?? 0 },
    { label: "챌린지", value: challengeCount ?? 0 },
  ];

  const isDeleted = deleted === "true";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-ink">관리자</h1>
        <Link
          href="/"
          className="text-xs text-stone underline underline-offset-4 hover:text-ink"
        >
          ← 홈으로
        </Link>
      </div>

      {/* 탭 */}
      <nav className="flex gap-1 rounded-[var(--radius-pill)] bg-paper p-1">
        {[
          { key: "dashboard", label: "대시보드" },
          { key: "sentences", label: "문장 관리" },
          { key: "daily-words", label: "오늘의 단어" },
          { key: "sns", label: "SNS" },
          { key: "feedback", label: "피드백" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/admin?tab=${t.key}`}
            className={`rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-surface text-ink shadow-sm"
                : "text-stone hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "dashboard" ? (
        /* ── 대시보드 ── */
        <div className="flex flex-col gap-8">
          <AdminKpi items={kpiItems} />

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-bold tracking-widest text-stone">
              전체 현황
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-5 shadow-[var(--shadow-card)]"
                >
                  <span className="text-2xl font-bold tabular-nums text-ink">
                    {s.value.toLocaleString("ko-KR")}
                  </span>
                  <span className="text-xs text-stone">{s.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : tab === "feedback" ? (
        /* ── 피드백 ── */
        <AdminFeedbackList items={feedbackItems ?? []} />
      ) : tab === "sns" ? (
        /* ── SNS 콘텐츠 ── */
        <AdminSns sentences={snsRanked} dailyWord={todayDailyWord} />
      ) : tab === "daily-words" ? (
        /* ── 오늘의 단어 관리 ── */
        <AdminDailyWords
          words={dailyWords ?? []}
          lastScheduledDate={dailyWords?.[0]?.scheduled_date ?? null}
        />
      ) : (
        /* ── 문장 관리 ── */
        <section className="flex flex-col gap-4">
          {/* 검색 + 필터 */}
          <div className="flex flex-wrap items-center gap-3">
            <form className="flex flex-1 items-center gap-2" action="/admin">
              <input type="hidden" name="tab" value="sentences" />
              {isDeleted ? <input type="hidden" name="deleted" value="true" /> : null}
              <input
                name="q"
                defaultValue={q}
                placeholder="문장 검색..."
                className="w-full min-w-0 rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-archive"
              />
              <button
                type="submit"
                className="shrink-0 rounded-[var(--radius-pill)] bg-archive px-4 py-2 text-sm text-archive-contrast hover:opacity-90"
              >
                검색
              </button>
            </form>
            <Link
              href={`/admin?tab=sentences${isDeleted ? "" : "&deleted=true"}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs transition-colors ${
                isDeleted
                  ? "border-coral bg-coral/10 text-coral"
                  : "border-hairline-strong text-stone hover:text-ink"
              }`}
            >
              {isDeleted ? "삭제된 문장 보는 중" : "삭제된 문장 보기"}
            </Link>
          </div>

          {/* 문장 목록 */}
          <AdminSentenceList
            sentences={sentences ?? []}
            isDeletedView={isDeleted}
          />

          {/* 페이지네이션 */}
          {totalPages > 1 ? (
            <nav className="flex items-center justify-center gap-2">
              {pageNum > 1 ? (
                <Link
                  href={`/admin?tab=sentences&page=${pageNum - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}${isDeleted ? "&deleted=true" : ""}`}
                  className="rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1.5 text-xs text-stone hover:text-ink"
                >
                  ← 이전
                </Link>
              ) : null}
              <span className="text-xs tabular-nums text-stone">
                {pageNum} / {totalPages}
              </span>
              {pageNum < totalPages ? (
                <Link
                  href={`/admin?tab=sentences&page=${pageNum + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}${isDeleted ? "&deleted=true" : ""}`}
                  className="rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1.5 text-xs text-stone hover:text-ink"
                >
                  다음 →
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      )}
    </main>
  );
}
