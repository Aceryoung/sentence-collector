type Props = {
  body: string;
  source: string | null;
  likeCount: number;
};

export function SentenceCard({ body, source, likeCount }: Props) {
  return (
    <article className="flex flex-col gap-4 border border-hairline border-l-2 bg-surface px-6 py-5 transition-colors hover:border-l-archive">
      <p className="text-lg leading-relaxed font-semibold text-ink text-balance">
        {body}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`border px-2 py-0.5 font-mono text-xs ${
            source
              ? "border-hairline-strong text-archive"
              : "border-hairline-strong text-stone"
          }`}
        >
          {source || "출처 미상"}
        </span>
        <span className="font-mono text-sm text-stone tabular-nums">
          ♡ {likeCount.toLocaleString("ko-KR")}
        </span>
      </div>
    </article>
  );
}
