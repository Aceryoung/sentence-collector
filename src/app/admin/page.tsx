import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import { AdminSentenceList } from "./AdminSentenceList";
import { AdminDailyWords } from "./AdminDailyWords";
import { AdminFeedbackList } from "./AdminFeedbackList";

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

  // ── 피드백 ──
  const { data: feedbackItems } = await supabase
    .from("feedback")
    .select("id, category, body, page_url, created_at, resolved")
    .order("created_at", { ascending: false })
    .limit(100);

  const stats = [
    { label: "문장", value: sentenceCount ?? 0, emoji: "📝" },
    { label: "사용자", value: userCount ?? 0, emoji: "👤" },
    { label: "좋아요", value: likeCount ?? 0, emoji: "❤️" },
    { label: "필사", value: practiceCount ?? 0, emoji: "✍️" },
    { label: "감상", value: reflectionCount ?? 0, emoji: "💬" },
    { label: "팔로우", value: followCount ?? 0, emoji: "🤝" },
    { label: "컬렉션", value: collectionCount ?? 0, emoji: "📚" },
    { label: "챌린지", value: challengeCount ?? 0, emoji: "🏆" },
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
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-5 shadow-[var(--shadow-card)]"
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-2xl font-bold tabular-nums text-ink">
                {s.value.toLocaleString("ko-KR")}
              </span>
              <span className="text-xs text-stone">{s.label}</span>
            </div>
          ))}
        </section>
      ) : tab === "feedback" ? (
        /* ── 피드백 ── */
        <AdminFeedbackList items={feedbackItems ?? []} />
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
