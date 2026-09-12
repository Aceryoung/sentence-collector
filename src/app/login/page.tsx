import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";
import { BrandMascot } from "@/components/BrandMascot";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // 이미 로그인된 사용자는 홈으로 보낸다 — 불필요한 재인증 방지
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/");

  // 세로 중앙 정렬을 쓰면 모바일에서 화면 위쪽 절반이 비고 폼이 아래로 몰린다.
  // 키보드가 올라오면 그 폼마저 가려지므로 위에서부터 배치한다.
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 py-12 sm:py-24">
      <div className="animate-fade-up flex flex-col items-center gap-3 text-center">
        <BrandMascot className="h-16 w-[47px] text-archive" />
        <h1 className="font-serif text-2xl font-bold text-ink">글적에 오신 걸 환영해요</h1>
        <p className="text-sm text-stone">문장을 모으고, 다시 꺼내보고, 나누는 곳</p>
      </div>
      <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <LoginForm initialError={error} />
      </div>
    </main>
  );
}
