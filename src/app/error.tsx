"use client";

import { BrandMascot } from "@/components/BrandMascot";

/**
 * 글로벌 에러 바운더리.
 *
 * 마스코트와 따뜻한 메시지로 에러 상황의 불안감을 줄인다.
 * 재시도 버튼으로 사용자가 즉시 복구를 시도할 수 있다.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <BrandMascot className="h-20 w-[59px] text-stone" />

      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-lg font-bold text-ink">
          잠시 문제가 생겼어요
        </h1>
        <p className="text-sm leading-relaxed text-stone">
          문장을 불러오는 중에 오류가 발생했어요.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-[var(--radius-pill)] bg-cta px-5 py-2.5 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover"
        >
          다시 시도
        </button>
        <a
          href="/"
          className="rounded-[var(--radius-pill)] border border-hairline-strong px-5 py-2.5 text-sm text-stone transition-colors hover:text-ink"
        >
          홈으로 돌아가기
        </a>
      </div>
    </main>
  );
}
