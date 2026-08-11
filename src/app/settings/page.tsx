import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PasswordForm } from "./PasswordForm";
import { SkipPasswordButton } from "./SkipPasswordButton";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const { setup } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 로그인 직후 안내로 들어온 경우. 왜 이 화면에 왔는지 설명하고,
  // 건너뛸 길도 함께 준다.
  const isSetup = setup === "1";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-12 sm:py-24">
      <h1 className="font-serif text-xl font-bold text-ink">
        {isSetup ? "다음부터 더 빠르게" : "계정 설정"}
      </h1>

      {isSetup ? (
        <p className="text-sm leading-relaxed text-stone">
          지금은 로그인할 때마다 메일을 받아야 해요. 비밀번호를 설정해두면
          다른 기기에서도 메일 없이 바로 들어올 수 있어요.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-stone">
            이메일
          </span>
          <p className="text-sm break-words text-ink">{user.email}</p>
        </div>
      )}

      <PasswordForm variant={isSetup ? "setup" : "settings"} />

      {isSetup ? (
        <SkipPasswordButton />
      ) : (
        <Link
          href="/my"
          className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
        >
          ← 내 보관함으로
        </Link>
      )}
    </main>
  );
}
