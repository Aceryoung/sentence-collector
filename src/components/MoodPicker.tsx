"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { SentenceCardData } from "@/lib/sentences";

const MOOD_CHIPS = [
  "위로",
  "동기부여",
  "사랑",
  "깨달음",
  "유머",
  "그리움",
  "용기",
  "성찰",
] as const;

export function MoodPicker() {
  const [selected, setSelected] = useState<string | null>(null);
  const [sentences, setSentences] = useState<SentenceCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);

  async function fetchByMood(tag: string) {
    setLoading(true);
    setEmpty(false);

    const supabase = createClient();

    // 태그에 해당하는 전체 id 목록을 가져와 클라이언트에서 랜덤 3개 선택
    const { data: idRows } = await supabase
      .from("sentences")
      .select("id")
      .eq("emotion_tag", tag)
      .is("deleted_at", null);

    const ids = (idRows ?? []).map((r) => r.id as string);

    if (ids.length === 0) {
      setSentences([]);
      setEmpty(true);
      setLoading(false);
      return;
    }

    // 랜덤 3개 선택
    const picked = shuffle(ids).slice(0, 3);

    const { data } = await supabase
      .from("sentences")
      .select("id, body, source, commentary, emotion_tag, likes(count)")
      .in("id", picked);

    const result: SentenceCardData[] = (data ?? []).map((row) => ({
      id: row.id,
      body: row.body,
      source: row.source,
      commentary: row.commentary,
      emotionTag: row.emotion_tag,
      likeCount: (row.likes as { count: number }[])?.[0]?.count ?? 0,
    }));

    setSentences(result);
    setEmpty(result.length === 0);
    setLoading(false);
  }

  function handleSelect(tag: string) {
    setSelected(tag);
    fetchByMood(tag);
  }

  function handleRefresh() {
    if (selected) fetchByMood(selected);
  }

  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-4">
      <h2 className="font-serif text-sm font-bold text-ink">
        지금 어떤 문장이 필요해요?
      </h2>

      <div className="flex flex-wrap gap-1.5">
        {MOOD_CHIPS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleSelect(tag)}
            className={`rounded-[var(--radius-pill)] border px-2.5 py-1 text-xs transition-all duration-200 ${
              selected === tag
                ? "border-archive bg-archive text-archive-contrast"
                : "border-hairline-strong bg-paper text-stone hover:border-archive/40 hover:text-ink active:scale-95"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-4 text-center text-sm text-stone">찾는 중…</p>
      ) : null}

      {!loading && selected && sentences.length > 0 ? (
        <>
          <span className="text-xs font-bold text-coral">
            {selected}이 필요한 당신에게
          </span>
          <div className="flex flex-col gap-2">
            {sentences.map((s) => (
              <Link
                key={s.id}
                href={`/sentences/${s.id}`}
                className="block rounded-[var(--radius-card)] border border-hairline px-3 py-3 transition-all duration-200 hover:border-archive/40 hover:shadow-sm"
              >
                <p className="user-text line-clamp-2 text-sm leading-relaxed text-ink">
                  {s.body}
                </p>
                <span className="mt-1 block text-xs text-stone-faint">
                  {s.source || "출처 미상"}
                </span>
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
          >
            ↻ 다른 문장
          </button>
        </>
      ) : null}

      {!loading && empty ? (
        <p className="py-4 text-center text-sm text-stone">
          아직 &lsquo;{selected}&rsquo; 문장이 부족해요. 첫 문장을 남겨보세요.
        </p>
      ) : null}
    </section>
  );
}

function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
