import Link from "next/link";
import { EMOTION_TAGS } from "@/lib/validation";

type Props = {
  activeTag: string | null;
  /** 기본 "/"이 아닌 경로에서 사용할 때 (예: "/my") */
  basePath?: string;
};

export function TagFilter({ activeTag, basePath = "/" }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="감정 태그 필터">
      <TagChip
        tag={null}
        label="전체"
        active={activeTag === null}
        basePath={basePath}
      />
      {EMOTION_TAGS.map((tag) => (
        <TagChip
          key={tag}
          tag={tag}
          label={tag}
          active={activeTag === tag}
          basePath={basePath}
        />
      ))}
    </div>
  );
}

function TagChip({
  tag,
  label,
  active,
  basePath,
}: {
  tag: string | null;
  label: string;
  active: boolean;
  basePath: string;
}) {
  const href = tag ? `${basePath}?tag=${encodeURIComponent(tag)}` : basePath;

  return (
    <Link
      href={href}
      className={`shrink-0 rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-archive bg-archive text-archive-contrast"
          : "border-hairline-strong bg-surface text-stone hover:border-archive/40 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
