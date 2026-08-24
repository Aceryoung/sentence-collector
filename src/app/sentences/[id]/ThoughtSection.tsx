"use client";

import { useActionState, useState } from "react";
import { addThought, updateThought, deleteThought, type ThoughtState } from "./thought-actions";

type Thought = {
  id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type Props = {
  sentenceId: string;
  thoughts: Thought[];
};

const initialState: ThoughtState = { error: null };

export function ThoughtSection({ sentenceId, thoughts }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-lg font-bold text-ink">
        내 생각
        {thoughts.length > 0 ? (
          <span className="ml-2 text-sm font-normal text-stone">
            {thoughts.length}
          </span>
        ) : null}
      </h2>

      {thoughts.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {thoughts.map((t) =>
            editingId === t.id ? (
              <li key={t.id}>
                <EditThoughtForm
                  thought={t}
                  sentenceId={sentenceId}
                  onCancel={() => setEditingId(null)}
                  onDone={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li
                key={t.id}
                className="rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4"
              >
                <p className="user-text leading-relaxed text-ink whitespace-pre-wrap">
                  {t.body}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-stone-faint">
                  <time>
                    {new Date(t.created_at).toLocaleDateString("ko-KR")}
                  </time>
                  <button
                    type="button"
                    onClick={() => setEditingId(t.id)}
                    className="underline underline-offset-4 hover:text-ink"
                  >
                    수정
                  </button>
                  <form action={deleteThought}>
                    <input type="hidden" name="thoughtId" value={t.id} />
                    <input type="hidden" name="sentenceId" value={sentenceId} />
                    <button
                      type="submit"
                      className="underline underline-offset-4 hover:text-ink"
                    >
                      삭제
                    </button>
                  </form>
                </div>
              </li>
            ),
          )}
        </ul>
      ) : (
        <p className="py-4 text-center text-sm text-stone">
          이 문장에서 떠오른 생각을 자유롭게 적어보세요.
        </p>
      )}

      <AddThoughtForm sentenceId={sentenceId} />
    </section>
  );
}

function AddThoughtForm({ sentenceId }: { sentenceId: string }) {
  const [state, formAction, isPending] = useActionState(addThought, initialState);
  const [open, setOpen] = useState(false);
  // success 시 폼 닫기
  if (state.success && open) {
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        + 생각 남기기
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="sentenceId" value={sentenceId} />
      <textarea
        name="body"
        rows={4}
        autoFocus
        className="resize-none rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-4 py-3 text-ink leading-relaxed outline-none transition-colors focus-visible:border-cta focus-visible:shadow-[0_0_0_1px_var(--cta)]"
        placeholder="이 문장을 읽고 떠오른 나만의 생각, 기억, 다짐을 적어보세요"
      />
      {state.error ? (
        <p className="text-xs text-archive">{state.error}</p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-[var(--radius-pill)] border-none bg-cta px-4 py-2 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover disabled:opacity-60"
        >
          {isPending ? "저장 중…" : "저장"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-[var(--radius-pill)] border border-hairline-strong px-4 py-2 text-sm text-stone hover:text-ink"
        >
          취소
        </button>
      </div>
    </form>
  );
}

function EditThoughtForm({
  thought,
  sentenceId,
  onCancel,
  onDone,
}: {
  thought: Thought;
  sentenceId: string;
  onCancel: () => void;
  onDone: () => void;
}) {
  const [state, formAction, isPending] = useActionState(updateThought, initialState);

  if (state.success) {
    onDone();
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-cta/30 bg-surface px-5 py-4"
    >
      <input type="hidden" name="thoughtId" value={thought.id} />
      <input type="hidden" name="sentenceId" value={sentenceId} />
      <textarea
        name="body"
        rows={4}
        defaultValue={thought.body}
        autoFocus
        className="resize-none rounded-[var(--radius-input)] border border-hairline-strong bg-paper px-4 py-3 text-ink leading-relaxed outline-none transition-colors focus-visible:border-cta focus-visible:shadow-[0_0_0_1px_var(--cta)]"
      />
      {state.error ? (
        <p className="text-xs text-archive">{state.error}</p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-[var(--radius-pill)] border-none bg-cta px-4 py-2 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover disabled:opacity-60"
        >
          {isPending ? "수정 중…" : "수정"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[var(--radius-pill)] border border-hairline-strong px-4 py-2 text-sm text-stone hover:text-ink"
        >
          취소
        </button>
      </div>
    </form>
  );
}
