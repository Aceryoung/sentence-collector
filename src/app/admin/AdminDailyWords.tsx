"use client";

import { useState, useTransition } from "react";
import { addDailyWord, bulkAddDailyWords, deleteDailyWord } from "./actions";
import { useToast } from "@/components/Toast";

type DailyWord = {
  id: string;
  word: string;
  description: string | null;
  scheduled_date: string;
};

export function AdminDailyWords({
  words,
  lastScheduledDate,
}: {
  words: DailyWord[];
  lastScheduledDate: string | null;
}) {
  const [word, setWord] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const today = new Date().toISOString().split("T")[0];
  const futureWords = words.filter((w) => w.scheduled_date >= today);
  const pastWords = words.filter((w) => w.scheduled_date < today);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!word.trim() || !scheduledDate) return;
    startTransition(async () => {
      const result = await addDailyWord(word.trim(), description.trim() || null, scheduledDate);
      if (result.error) {
        toast(result.error, "error");
      } else {
        toast("단어가 등록되었습니다.", "success");
        setWord("");
        setDescription("");
        setScheduledDate("");
      }
    });
  }

  function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    startTransition(async () => {
      const result = await bulkAddDailyWords(lines);
      if (result.error) {
        toast(result.error, "error");
      } else {
        toast(`${result.count}개 단어가 등록되었습니다.`, "success");
        setBulkText("");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteDailyWord(id);
      if (result.error) {
        toast(result.error, "error");
      } else {
        toast("삭제되었습니다.", "success");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 대량 등록 */}
      <form
        onSubmit={handleBulkSubmit}
        className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-5"
      >
        <h3 className="text-sm font-bold text-ink">단어 대량 등록</h3>
        <p className="text-xs text-stone">
          한 줄에 하나씩 입력하면 마지막 등록일({lastScheduledDate ?? today}) 다음 날부터 자동 배정됩니다.
        </p>
        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder={"고독\n설렘\n여백\n온기\n그리움"}
          rows={6}
          className="w-full resize-none rounded-[var(--radius-card)] border border-hairline bg-paper px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-stone-faint focus:border-archive focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs tabular-nums text-stone-faint">
            {bulkText.split("\n").filter((l) => l.trim()).length}개 단어
          </span>
          <button
            type="submit"
            disabled={isPending || !bulkText.trim()}
            className="rounded-[var(--radius-pill)] bg-cta px-4 py-2 text-xs font-bold text-cta-contrast hover:bg-cta-hover disabled:opacity-50"
          >
            {isPending ? "등록 중..." : "일괄 등록"}
          </button>
        </div>
      </form>

      {/* 개별 등록 */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-5"
      >
        <h3 className="text-sm font-bold text-ink">개별 등록</h3>
        <div className="flex flex-wrap gap-3">
          <input
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            type="date"
            required
            className="rounded-[var(--radius-input)] border border-hairline-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:border-archive"
          />
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="단어"
            required
            maxLength={50}
            className="flex-1 rounded-[var(--radius-input)] border border-hairline-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:border-archive"
          />
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="설명 (선택)"
          maxLength={200}
          className="rounded-[var(--radius-input)] border border-hairline-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:border-archive"
        />
        <button
          type="submit"
          disabled={isPending}
          className="self-end rounded-[var(--radius-pill)] bg-cta px-4 py-2 text-xs font-bold text-cta-contrast hover:bg-cta-hover disabled:opacity-50"
        >
          {isPending ? "등록 중..." : "등록"}
        </button>
      </form>

      {/* 예정된 단어 */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold text-ink">
          예정된 단어 ({futureWords.length})
        </h3>
        {futureWords.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {futureWords.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <time className="w-24 shrink-0 text-xs tabular-nums text-stone-faint">
                    {w.scheduled_date}
                  </time>
                  <span className="font-serif text-sm font-bold text-ink">{w.word}</span>
                  {w.description ? (
                    <span className="text-xs text-stone">— {w.description}</span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(w.id)}
                  disabled={isPending}
                  className="rounded-[var(--radius-pill)] border border-hairline-strong px-2.5 py-1 text-xs text-stone hover:border-coral hover:text-coral disabled:opacity-50"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-center text-sm text-stone">예정된 단어가 없습니다.</p>
        )}
      </div>

      {/* 지난 단어 */}
      {pastWords.length > 0 ? (
        <details className="flex flex-col gap-2">
          <summary className="cursor-pointer text-sm font-bold text-stone">
            지난 단어 ({pastWords.length})
          </summary>
          <ul className="mt-2 flex flex-col gap-1">
            {pastWords.map((w) => (
              <li
                key={w.id}
                className="flex items-center gap-3 px-4 py-2 text-xs text-stone-faint"
              >
                <time className="w-24 shrink-0 tabular-nums">{w.scheduled_date}</time>
                <span className="text-ink">{w.word}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
