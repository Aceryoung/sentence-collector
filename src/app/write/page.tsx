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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div className="flex items-center gap-3">
        <BrandMascot className="hidden h-10 w-[29px] shrink-0 text-archive sm:block" />
        <div className="flex flex-col gap-0.5">
          <h1 className="font-serif text-xl font-bold text-ink">문장 등록</h1>
          <p className="text-xs italic text-stone">
            당신의 마음에 머무른 한 줄을 나눠주세요
          </p>
        </div>
      </div>
      <WriteForm />
    </main>
  );
}
