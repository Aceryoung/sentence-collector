"use client";

import { useTransition } from "react";
import Link from "next/link";
import { adminDeleteSentence, adminRestoreSentence } from "./actions";
import { useToast } from "@/components/Toast";

type Sentence = {
  id: string;
  body: string;
  source: string | null;
  emotion_tag: string | null;
  created_at: string;
  deleted_at: string | null;
  author_id: string;
};

export function AdminSentenceList({
  sentences,
  isDeletedView,
}: {
  sentences: Sentence[];
  isDeletedView: boolean;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await adminDeleteSentence(id);
      if (result.error) {
        toast(result.error, "error");
      } else {
        toast("문장이 삭제되었어요.");
      }
    });
  }

  function handleRestore(id: string) {
    startTransition(async () => {
      const result = await adminRestoreSentence(id);
      if (result.error) {
        toast(result.error, "error");
      } else {
        toast("문장이 복원되었어요.");
      }
    });
  }

  if (sentences.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-stone">
        {isDeletedView ? "삭제된 문장이 없어요." : "문장이 없어요."}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {sentences.map((s) => (
        <li
          key={s.id}
          className={`flex items-start gap-4 rounded-[var(--radius-card)] border px-4 py-3 ${
            s.deleted_at
              ? "border-coral/30 bg-coral/5"
              : "border-hairline bg-surface"
          }`}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="line-clamp-2 text-sm text-ink">{s.body}</p>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-stone-faint">
              <span>{s.source || "출처 미상"}</span>
              {s.emotion_tag ? (
                <span className="rounded bg-archive/10 px-1.5 py-0.5 text-archive">
                  {s.emotion_tag}
                </span>
              ) : null}
              <span>{new Date(s.created_at).toLocaleDateString("ko-KR")}</span>
              <span className="font-mono">{s.id.slice(0, 8)}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/sentences/${s.id}`}
              className="rounded-[var(--radius-pill)] border border-hairline-strong px-2.5 py-1 text-[10px] text-stone hover:text-ink"
            >
              보기
            </Link>
            {isDeletedView ? (
              <button
                type="button"
                onClick={() => handleRestore(s.id)}
                disabled={isPending}
                className="rounded-[var(--radius-pill)] bg-archive px-2.5 py-1 text-[10px] text-archive-contrast hover:opacity-90 disabled:opacity-50"
              >
                복원
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                disabled={isPending}
                className="rounded-[var(--radius-pill)] border border-coral/40 px-2.5 py-1 text-[10px] text-coral hover:bg-coral/10 disabled:opacity-50"
              >
                삭제
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
