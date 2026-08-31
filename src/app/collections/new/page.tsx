import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewCollectionForm } from "./NewCollectionForm";

export default async function NewCollectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-12 sm:py-24">
      <h1 className="font-serif text-xl font-bold text-ink">새 컬렉션</h1>
      <p className="text-sm leading-relaxed text-stone">
        좋아하는 문장을 주제별로 모아보세요.
      </p>
      <NewCollectionForm />
    </main>
  );
}
