import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrandMascot } from "@/components/BrandMascot";
import { WriteForm } from "./WriteForm";

export default async function WritePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
