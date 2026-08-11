import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // 세로 중앙 정렬을 쓰면 모바일에서 화면 위쪽 절반이 비고 폼이 아래로 몰린다.
  // 키보드가 올라오면 그 폼마저 가려지므로 위에서부터 배치한다.
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-12 sm:py-24">
      <h1 className="font-serif text-xl font-bold text-ink">글적 로그인</h1>
      <LoginForm initialError={error} />
    </main>
  );
}
