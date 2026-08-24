import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SentenceCard } from "@/components/SentenceCard";
import { EmptyState } from "@/components/EmptyState";
import { getPeriodStart, getRanking, type Period } from "@/lib/ranking";
import { formatKstDateDisplay } from "@/lib/kst-date";

const PERIODS: { value: Period; label: string }[] = [
  { value: "day", label: "일간" },
  { value: "week", label: "주간" },
  { value: "month", label: "월간" },
];

function isPeriod(value: string | undefined): value is Period {
  return value === "day" || value === "week" || value === "month";
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period: Period = isPeriod(rawPeriod) ? rawPeriod : "day";

  const supabase = await createClient();
  const now = new Date();
  const ranking = await getRanking(supabase, period, 20, now);
  const periodStart = getPeriodStart(period, now);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-xl font-bold text-ink">랭킹</h1>
      <nav className="flex gap-2 text-xs">
        {PERIODS.map((p) => (
          <Link
            key={p.value}
            href={`/ranking?period=${p.value}`}
            className={`rounded-[var(--radius-pill)] border px-3 py-1.5 transition-all duration-200 ${
              p.value === period
                ? "border-archive bg-archive/5 text-archive shadow-sm"
                : "border-hairline-strong text-stone hover:text-ink hover:border-archive/40 active:scale-95"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </nav>
      <p className="text-xs text-stone">
        {formatKstDateDisplay(periodStart)} - {formatKstDateDisplay(now)}
      </p>
      {ranking.length > 0 ? (
        <ol className="stagger-grid grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ranking.map((sentence, index) => (
            <li key={sentence.id} className="flex items-start gap-3">
              <span className="w-6 shrink-0 pt-5 text-right text-sm text-stone tabular-nums">
                {index + 1}
              </span>
              <div className="flex-1">
                <SentenceCard
                  id={sentence.id}
                  body={sentence.body}
                  source={sentence.source}
                  commentary={sentence.commentary}
                  emotionTag={sentence.emotionTag}
                  likeCount={sentence.likeCount}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState
          withMascot
          message="아직 이 기간의 랭킹이 없어요."
          action={
            <Link
              href="/"
              className="rounded-[var(--radius-pill)] bg-cta px-5 py-2.5 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover"
            >
              문장 둘러보고 좋아요 남기기 →
            </Link>
          }
        />
      )}
    </main>
  );
}
