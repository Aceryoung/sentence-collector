import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PasswordForm } from "./PasswordForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-12 sm:py-24">
      <h1 className="font-serif text-xl text-ink">계정 설정</h1>

      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-wide text-stone">
          이메일
        </span>
        <p className="font-mono text-sm break-words text-ink">{user.email}</p>
      </div>

      <PasswordForm />

      <Link
        href="/my"
        className="self-start font-mono text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 내 보관함으로
      </Link>
    </main>
  );
}
