import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "작품별 문장",
  description: "같은 작품에서 발견한 여러 문장을 모아봅니다.",
};

export default async function WorksPage() {
  const supabase = await createClient();

  // source별 문장 수 집계 (source가 있는 것만)
  const { data: rows } = await supabase
    .from("sentences")
    .select("source")
    .is("deleted_at", null)
    .not("source", "is", null);

  // 수동 집계
  const counts = new Map<string, number>();
  for (const row of rows ?? []) {
    if (!row.source) continue;
    counts.set(row.source, (counts.get(row.source) ?? 0) + 1);
  }

  const works = [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 font-serif text-2xl font-bold text-ink">
        작품별 문장
      </h1>
      <p className="mb-8 text-sm text-stone">
        같은 작품에서 발견한 여러 대사, 구절, 생각을 모아봅니다.
      </p>

      {works.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {works.map((w) => (
            <li key={w.source}>
              <Link
                href={`/works/${encodeURIComponent(w.source)}`}
                className="flex items-center justify-between rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 transition-all hover:border-archive/40 hover:shadow-[var(--shadow-card-hover)]"
              >
                <span className="font-serif text-sm font-medium text-ink">
                  {w.source}
                </span>
                <span className="rounded-[var(--radius-pill)] bg-archive/10 px-2.5 py-0.5 text-xs tabular-nums text-archive">
                  {w.count}문장
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-12 text-center text-sm text-stone">
          아직 등록된 작품이 없어요.
        </p>
      )}
    </main>
  );
}
