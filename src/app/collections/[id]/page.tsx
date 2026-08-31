import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SENTENCE_WITH_LIKE_COUNT_SELECT, toSentenceCardData } from "@/lib/sentences";
import { SentenceCard } from "@/components/SentenceCard";
import { DeleteCollectionButton } from "./DeleteCollectionButton";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("id, title, description, is_public, user_id")
    .eq("id", id)
    .single();

  if (!collection) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === collection.user_id;

  // 비공개 컬렉션은 본인만
  if (!collection.is_public && !isOwner) notFound();

  const { data: items } = await supabase
    .from("collection_items")
    .select("sentence_id, added_at")
    .eq("collection_id", id)
    .order("added_at", { ascending: false });

  let sentences: ReturnType<typeof toSentenceCardData>[] = [];
  if (items && items.length > 0) {
    const ids = items.map((i) => i.sentence_id);
    const { data } = await supabase
      .from("sentences")
      .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
      .in("id", ids)
      .is("deleted_at", null);
    if (data) {
      // items 순서 유지
      const map = new Map(data.map((s) => [s.id, s]));
      sentences = ids
        .map((sid) => map.get(sid))
        .filter(Boolean)
        .map((s) => toSentenceCardData(s!));
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-xl font-bold text-ink">
            {collection.title}
          </h1>
          {collection.description ? (
            <p className="mt-1 text-sm text-stone">{collection.description}</p>
          ) : null}
          <div className="mt-2 flex items-center gap-2">
            <span className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-xs ${
              collection.is_public
                ? "bg-archive/10 text-archive"
                : "bg-surface text-stone"
            }`}>
              {collection.is_public ? "공개" : "비공개"}
            </span>
            <span className="text-xs text-stone-faint">
              {sentences.length}개의 문장
            </span>
          </div>
        </div>
        {isOwner ? <DeleteCollectionButton collectionId={id} /> : null}
      </div>

      {sentences.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {sentences.map((s) => (
            <li key={s.id}>
              <SentenceCard {...s} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-12 text-center text-sm text-stone">
          아직 문장이 없어요. 문장 상세에서 이 컬렉션에 추가해보세요.
        </p>
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
