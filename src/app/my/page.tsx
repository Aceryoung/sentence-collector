import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    .select("id, body, source, created_at, likes(count)")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const sentences = (data ?? []).map((sentence) => ({
    id: sentence.id,
    body: sentence.body,
    source: sentence.source,
    likeCount: sentence.likes?.[0]?.count ?? 0,
  }));

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
      <h1 className="font-serif text-xl text-ink">내 보관함</h1>
      <MyArchive sentences={sentences} />
    </main>
  );
}
