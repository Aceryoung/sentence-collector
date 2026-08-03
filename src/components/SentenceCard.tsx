import { ShareImageButton } from "@/components/ShareImageButton";
import { LikeButton } from "@/components/LikeButton";

type Props = {
  id: string;
  body: string;
  source: string | null;
  likeCount: number;
};

export function SentenceCard({ id, body, source, likeCount }: Props) {
  return (
    <article className="flex flex-col gap-4 border border-hairline border-l-2 bg-surface px-6 py-5 transition-colors hover:border-l-archive">
      <p className="text-lg leading-relaxed font-semibold break-words text-ink text-balance">
        {body}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`max-w-full border px-2 py-0.5 font-mono text-xs break-words ${
            source
              ? "border-hairline-strong text-archive"
              : "border-hairline-strong text-stone"
          }`}
        >
          {source || "출처 미상"}
        </span>
        <div className="flex items-center gap-1">
          <LikeButton sentenceId={id} initialCount={likeCount} />
          <ShareImageButton body={body} source={source} />
        </div>
      </div>
    </article>
  );
}
