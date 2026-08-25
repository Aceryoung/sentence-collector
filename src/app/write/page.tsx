import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BrandMascot } from "@/components/BrandMascot";
import { WriteForm } from "./WriteForm";

export default async function WritePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <BrandMascot className="h-20 w-[59px] text-archive" />
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-serif text-2xl font-bold text-ink">문장 등록</h1>
          <p className="text-sm leading-relaxed text-stone">
            마음에 닿은 문장을 저장하고, 나만의 감상을 덧붙여보세요.
            <br />
            로그인하면 바로 시작할 수 있어요.
          </p>
        </div>

        {/* 미리보기: 비활성 폼 */}
        <div className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-6 py-6 opacity-50 shadow-[var(--shadow-card)]" aria-hidden="true">
          <div className="flex flex-col gap-4">
            <div className="h-24 rounded-[var(--radius-input)] border border-hairline bg-paper" />
            <div className="h-10 w-2/3 rounded-[var(--radius-input)] border border-hairline bg-paper" />
            <div className="h-10 w-1/2 rounded-[var(--radius-input)] border border-hairline bg-paper" />
          </div>
        </div>

        <Link
          href="/login"
          className="btn-press rounded-[var(--radius-pill)] bg-cta px-6 py-3 text-sm font-bold text-cta-contrast transition-all duration-200 hover:bg-cta-hover hover:shadow-md"
        >
          로그인하고 등록하기
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      {/* 왼쪽 — 마스코트 인용 카드 (데스크탑만) */}
      <aside className="hidden w-72 shrink-0 flex-col items-center gap-6 pt-4 lg:flex">
        <div className="rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-5 text-center shadow-[var(--shadow-card)]">
          <p className="font-serif text-sm leading-relaxed text-ink">
            오늘 마음에 닿은
            <br />
            문장이 있나요?
          </p>
        </div>
        <BrandMascot className="h-36 w-[105px] text-archive" />
      </aside>

      {/* 오른쪽 — 등록 폼 */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-bold text-ink">
            기억을 아카이빙하다
          </h1>
          <p className="text-sm text-stone">
            마음에 남은 문장을 저장하고, 나만의 감상을 덧붙여보세요.
          </p>
        </div>

        <WriteForm />
      </div>
    </main>
  );
}
