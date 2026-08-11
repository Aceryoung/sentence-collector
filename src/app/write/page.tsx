import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="font-serif text-xl font-bold text-ink">문장 등록</h1>
      <WriteForm />
    </main>
  );
}
