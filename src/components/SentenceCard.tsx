import { ShareImageButton } from "@/components/ShareImageButton";
import { LikeButton } from "@/components/LikeButton";

type Props = {
  id: string;
  body: string;
  source: string | null;
  commentary?: string | null;
  emotionTag?: string | null;
  likeCount: number;
};

export function SentenceCard({ id, body, source, commentary, emotionTag, likeCount }: Props) {
  return (
    <article className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-hairline bg-surface px-6 py-5 shadow-[var(--shadow-card)] transition-colors hover:border-archive/40">
      <p className="text-lg leading-relaxed font-semibold break-words text-ink text-balance">
        {body}
      </p>
      {commentary ? (
        <p className="text-sm leading-relaxed break-words text-stone">
          {commentary}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`max-w-full rounded-[var(--radius-pill)] border px-3 py-0.5 font-mono text-xs break-words ${
              source
                ? "border-hairline-strong text-archive"
                : "border-hairline-strong text-stone"
            }`}
          >
            {source || "출처 미상"}
          </span>
          {emotionTag ? (
            <span className="rounded-[var(--radius-pill)] bg-archive/10 px-2.5 py-0.5 text-xs text-archive">
              {emotionTag}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <LikeButton sentenceId={id} initialCount={likeCount} />
          <ShareImageButton body={body} source={source} />
        </div>
      </div>
    </article>
  );
}
