import Link from "next/link";

type ThoughtWithSentence = {
  id: string;
  body: string;
  created_at: string;
  sentences: { id: string; body: string } | null;
};

export function MyThoughts({ thoughts }: { thoughts: ThoughtWithSentence[] }) {
  if (thoughts.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-stone">
        아직 쓴 글이 없어요. 문장을 읽고 떠오른 생각을 남겨보세요.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {thoughts.map((t) => (
        <li key={t.id}>
          <Link
            href={t.sentences ? `/sentences/${t.sentences.id}` : "#"}
            className="flex flex-col gap-1.5 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 transition-all hover:border-archive/40 hover:shadow-[var(--shadow-card)]"
          >
            <p className="line-clamp-2 text-sm leading-relaxed text-ink">
              {t.body}
            </p>
            {t.sentences ? (
              <p className="line-clamp-1 text-xs text-stone">
                ↳ {t.sentences.body}
              </p>
            ) : null}
            <time className="text-xs text-stone-faint">
              {new Date(t.created_at).toLocaleDateString("ko-KR")}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}
