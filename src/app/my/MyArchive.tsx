"use client";

import { useMemo, useState } from "react";
import { SentenceCard } from "@/components/SentenceCard";

type Sentence = {
  id: string;
  body: string;
  source: string | null;
  likeCount: number;
};

export function MyArchive({ sentences }: { sentences: Sentence[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sentences;
    return sentences.filter(
      (sentence) =>
        sentence.body.toLowerCase().includes(q) ||
        (sentence.source ?? "").toLowerCase().includes(q),
    );
  }, [sentences, query]);

  if (sentences.length === 0) {
    return (
      <p className="py-16 text-center font-mono text-sm text-stone">
        아직 모은 문장이 없어요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="문장이나 출처로 검색"
        className="border border-hairline-strong bg-surface px-3 py-2 font-mono text-sm text-ink outline-none focus-visible:border-archive"
      />
      {filtered.length === 0 ? (
        <p className="py-10 text-center font-mono text-sm text-stone">
          &apos;{query}&apos;와 일치하는 문장이 없어요.
        </p>
      ) : (
        filtered.map((sentence) => (
          <SentenceCard
            key={sentence.id}
            id={sentence.id}
            body={sentence.body}
            source={sentence.source}
            likeCount={sentence.likeCount}
          />
        ))
      )}
    </div>
  );
}
