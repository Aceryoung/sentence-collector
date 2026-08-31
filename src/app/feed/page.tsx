import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SENTENCE_WITH_LIKE_COUNT_SELECT, toSentenceCardData } from "@/lib/sentences";
import { SentenceCard } from "@/components/SentenceCard";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 팔로잉 목록
  const { data: followingRows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followingIds = (followingRows ?? []).map((r) => r.following_id);

  let sentences: ReturnType<typeof toSentenceCardData>[] = [];

  if (followingIds.length > 0) {
    const { data } = await supabase
      .from("sentences")
      .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
      .in("author_id", followingIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20);

    sentences = (data ?? []).map(toSentenceCardData);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-ink">피드</h1>

      {followingIds.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm text-stone">
            아직 팔로우하는 사람이 없어요.
          </p>
          <Link
            href="/"
            className="rounded-[var(--radius-pill)] bg-cta px-4 py-2 text-sm font-bold text-cta-contrast hover:bg-cta-hover"
          >
            문장 둘러보기
          </Link>
        </div>
      ) : sentences.length === 0 ? (
        <p className="py-16 text-center text-sm text-stone">
          팔로잉한 사람의 새 문장이 아직 없어요.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {sentences.map((s) => (
            <li key={s.id}>
              <SentenceCard {...s} />
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/my"
        className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 내 보관함으로
      </Link>
    </main>
  );
}
