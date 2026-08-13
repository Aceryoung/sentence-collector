"use client";

import { useState } from "react";
import { SentenceCard } from "@/components/SentenceCard";
import { createClient } from "@/lib/supabase/client";
import type { SentenceCardData } from "@/lib/sentences";

const MOOD_CHIPS = [
  { tag: "위로", emoji: "😌" },
  { tag: "동기부여", emoji: "💪" },
  { tag: "사랑", emoji: "❤️" },
  { tag: "깨달음", emoji: "💡" },
  { tag: "유머", emoji: "😄" },
  { tag: "그리움", emoji: "🌙" },
  { tag: "용기", emoji: "🦁" },
  { tag: "성찰", emoji: "🪞" },
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
    <section className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-5 shadow-[var(--shadow-card)]">
      <h2 className="text-center font-serif text-base font-bold text-ink">
        지금 어떤 문장이 필요해요?
      </h2>

      <div className="flex flex-wrap justify-center gap-2">
        {MOOD_CHIPS.map(({ tag, emoji }) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleSelect(tag)}
            className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm transition-colors ${
              selected === tag
                ? "border-archive bg-archive text-archive-contrast"
                : "border-hairline-strong bg-paper text-stone hover:border-archive/40 hover:text-ink"
            }`}
          >
            {emoji} {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-4 text-center text-sm text-stone">찾는 중…</p>
      ) : null}

      {!loading && selected && sentences.length > 0 ? (
        <>
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-hairline" />
            <span className="text-xs font-bold uppercase tracking-widest text-coral">
              {selected}이 필요한 당신에게
            </span>
            <span className="h-px flex-1 bg-hairline" />
          </div>
          <div className="flex flex-col gap-3">
            {sentences.map((s) => (
              <SentenceCard
                key={s.id}
                id={s.id}
                body={s.body}
                source={s.source}
                commentary={s.commentary}
                emotionTag={s.emotionTag}
                likeCount={s.likeCount}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="self-center text-xs text-stone underline underline-offset-4 hover:text-ink"
          >
            ↻ 다른 문장 보기
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
