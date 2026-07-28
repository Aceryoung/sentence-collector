import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SENTENCE_WITH_LIKE_COUNT_SELECT, toSentenceCardData } from "@/lib/sentences";
import { MyArchive } from "./MyArchive";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("sentences")
    .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const sentences = (data ?? []).map(toSentenceCardData);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
      <h1 className="font-serif text-xl text-ink">내 보관함</h1>
      <MyArchive sentences={sentences} />
    </main>
  );
}
