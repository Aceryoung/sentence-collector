import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SentenceCard } from "@/components/SentenceCard";
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
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
      <h1 className="font-serif text-xl text-ink">랭킹</h1>
      <nav className="flex gap-2 font-mono text-xs">
        {PERIODS.map((p) => (
          <Link
            key={p.value}
            href={`/ranking?period=${p.value}`}
            className={`rounded-[var(--radius-pill)] border px-3 py-1.5 ${
              p.value === period
                ? "border-archive text-archive"
                : "border-hairline-strong text-stone hover:text-ink"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </nav>
      <p className="font-mono text-xs text-stone">
        {formatKstDateDisplay(periodStart)} - {formatKstDateDisplay(now)}
      </p>
      {ranking.length > 0 ? (
        <ol className="flex flex-col gap-3">
          {ranking.map((sentence, index) => (
            <li key={sentence.id} className="flex items-start gap-3">
              <span className="w-6 shrink-0 pt-5 text-right font-mono text-sm text-stone tabular-nums">
                {index + 1}
              </span>
              <div className="flex-1">
                <SentenceCard
                  id={sentence.id}
                  body={sentence.body}
                  source={sentence.source}
                  commentary={sentence.commentary}
                  likeCount={sentence.likeCount}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-center font-mono text-sm text-stone">
            아직 이 기간의 랭킹이 없어요.
          </p>
          <Link
            href="/"
            className="rounded-[var(--radius-pill)] border border-hairline-strong px-4 py-2 font-mono text-sm text-ink hover:border-archive"
          >
            문장 둘러보고 좋아요 남기기 →
          </Link>
        </div>
      )}
    </main>
  );
}
