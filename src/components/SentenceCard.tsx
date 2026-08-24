import Link from "next/link";
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
    <article className="card-lift animate-fade-up group relative flex h-full flex-col gap-4 rounded-[var(--radius-card)] border border-hairline bg-surface px-6 py-5 shadow-[var(--shadow-card)] hover:border-archive/40 hover:shadow-[var(--shadow-card-hover)]">
      {/* 카드 전체 클릭 영역 — stretched link 패턴 */}
      <Link
        href={`/sentences/${id}`}
        className="absolute inset-0 z-0 rounded-[var(--radius-card)]"
        aria-label={body.slice(0, 40)}
      />

      <div className="pointer-events-none relative z-[1] flex flex-col gap-4">
        <p className="user-text line-clamp-3 text-lg font-semibold leading-relaxed text-ink">
          {body}
        </p>
        {commentary ? (
          <p className="user-text line-clamp-2 text-sm italic leading-relaxed text-stone">
            {commentary}
          </p>
        ) : (
          <p className="text-xs text-stone-faint">감상을 남겨보세요 →</p>
        )}
      </div>

      <div className="relative z-[1] mt-auto flex flex-wrap items-center justify-between gap-3">
        <div className="pointer-events-none flex flex-wrap items-center gap-2">
          <span
            className={`max-w-full rounded-[var(--radius-pill)] border px-3 py-0.5 text-xs break-words ${
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
        <div className="pointer-events-auto flex items-center gap-1">
          <LikeButton sentenceId={id} initialCount={likeCount} />
          <ShareImageButton body={body} source={source} />
        </div>
      </div>
    </article>
  );
}
