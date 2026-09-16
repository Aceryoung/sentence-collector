"use client";

import { useState, useTransition } from "react";
import { EMOTION_TAGS } from "@/lib/validation";
import { upsertUserTag } from "@/app/sentences/[id]/tag-actions";

type TagCount = { tag: string; count: number };

type Props = {
  sentenceId: string;
  authorTag: string | null;
  tagCounts: TagCount[];
  myTag: string | null;
  isLoggedIn: boolean;
};

export function TagVoteSection({
  sentenceId,
  authorTag,
  tagCounts,
  myTag,
  isLoggedIn,
}: Props) {
  const [selected, setSelected] = useState<string | null>(myTag);
  const [isPending, startTransition] = useTransition();
  const [showPicker, setShowPicker] = useState(false);

  const total = tagCounts.reduce((sum, t) => sum + t.count, 0);

  function handleSelect(tag: string) {
    setSelected(tag);
    setShowPicker(false);
    startTransition(async () => {
      await upsertUserTag(sentenceId, tag);
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-sm font-bold text-ink">
          시선의 충돌
        </h2>
        {isLoggedIn && !showPicker ? (
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="text-xs text-archive underline underline-offset-4 hover:text-ink"
          >
            {selected ? "태그 변경" : "내 태그 남기기"}
          </button>
        ) : null}
      </div>

      <p className="text-xs leading-relaxed text-stone">
        같은 문장, 다른 감정. 이 문장에서 어떤 감정을 느꼈나요?
      </p>

      {/* 태그 선택기 */}
      {showPicker && isLoggedIn ? (
        <div className="flex flex-wrap gap-1.5">
          {EMOTION_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(tag)}
              className={`rounded-[var(--radius-pill)] border px-2.5 py-1 text-xs transition-all ${
                selected === tag
                  ? "border-archive bg-archive text-archive-contrast"
                  : "border-hairline-strong text-stone hover:border-archive/40 hover:text-ink"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      {/* 태그 분포 시각화 */}
      {tagCounts.length > 0 ? (
        <div className="flex flex-col gap-2">
          {tagCounts.map(({ tag, count }) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const isAuthor = tag === authorTag;
            const isMine = tag === selected;
            return (
              <div key={tag} className="flex items-center gap-2">
                <span
                  className={`w-16 shrink-0 text-right text-xs ${
                    isMine ? "font-bold text-archive" : "text-stone"
                  }`}
                >
                  {tag}
                </span>
                <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-surface">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                      isAuthor
                        ? "bg-archive/30"
                        : "bg-archive/15"
                    }`}
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center text-[10px] tabular-nums text-stone">
                    {count}명 · {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-3 text-center text-xs text-stone">
          아직 아무도 태그를 남기지 않았어요.{" "}
          {isLoggedIn ? "첫 번째가 되어보세요!" : ""}
        </p>
      )}

      {!isLoggedIn ? (
        <a
          href="/login"
          className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
        >
          로그인하고 내 시선 남기기
        </a>
      ) : null}
    </section>
  );
}
