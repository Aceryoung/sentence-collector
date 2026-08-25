import Link from "next/link";
import { LEGAL } from "@/lib/legal";

/**
 * 처리방침과 약관은 모든 화면에서 닿을 수 있어야 한다(PIPA §30 ③ 공개 의무).
 * 상단 네비는 이미 좁아서 하단에 둔다.
 */
export function SiteFooter() {
  return (
    <footer aria-label="사이트 정보" className="mt-auto border-t border-hairline px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 text-xs text-stone-faint">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/terms" className="hover:text-ink">
            이용약관
          </Link>
          {/* 처리방침은 다른 링크보다 강조하도록 안내한 작성지침을 따른다. */}
          <Link href="/privacy" className="font-semibold text-stone hover:text-ink">
            개인정보 처리방침
          </Link>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-0.5">
          <span>{LEGAL.operatorName}</span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span>대표 {LEGAL.cpoName}</span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span>사업자등록번호 {LEGAL.businessNumber}</span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span>{LEGAL.contactEmail}</span>
        </div>
      </div>
    </footer>
  );
}
