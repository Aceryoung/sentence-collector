import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SENTENCE_WITH_LIKE_COUNT_SELECT, toSentenceCardData } from "@/lib/sentences";
import { LikeButton } from "@/components/LikeButton";
import { ShareImageButton } from "@/components/ShareImageButton";
import { ReflectionForm } from "./ReflectionForm";
import { ThoughtSection } from "./ThoughtSection";

export default async function SentenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: raw } = await supabase
    .from("sentences")
    .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!raw) notFound();

  const sentence = toSentenceCardData(raw);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비공개 내 생각 — 로그인 사용자 본인 것만 (RLS가 보장)
  const { data: thoughts } = user
    ? await supabase
        .from("thoughts")
        .select("id, body, created_at, updated_at")
        .eq("sentence_id", id)
        .order("created_at", { ascending: false })
    : { data: null };

  const { data: reflections } = await supabase
    .from("reflections")
    .select("id, body, created_at")
    .eq("sentence_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-12">
      {/* 문장 본문 — 큰 화면 감상 */}
      <section className="flex flex-col items-center gap-6 text-center">
        <p className="user-text font-serif text-2xl leading-loose font-semibold text-ink sm:text-3xl">
          {sentence.body}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1 text-sm text-stone">
            {sentence.source || "출처 미상"}
          </span>
          {sentence.emotionTag ? (
            <span className="rounded-[var(--radius-pill)] bg-archive/10 px-2.5 py-0.5 text-xs text-archive">
              {sentence.emotionTag}
            </span>
          ) : null}
        </div>

        {sentence.commentary ? (
          <p className="max-w-md italic leading-relaxed text-stone">
            {sentence.commentary}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <LikeButton sentenceId={sentence.id} initialCount={sentence.likeCount} />
          <ShareImageButton body={sentence.body} source={sentence.source} />
        </div>
      </section>

      {/* 내 생각 — 비공개, 로그인 사용자만 */}
      {user ? (
        <>
          <hr className="border-hairline" />
          <ThoughtSection sentenceId={id} thoughts={thoughts ?? []} />
        </>
      ) : null}

      <hr className="border-hairline" />

      {/* 감상 목록 */}
      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-lg font-bold text-ink">
          Reflections
          {reflections && reflections.length > 0 ? (
            <span className="ml-2 text-sm font-normal text-stone">
              {reflections.length}
            </span>
          ) : null}
        </h2>

        {reflections && reflections.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {reflections.map((r) => (
              <li
                key={r.id}
                className="rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4"
              >
                <p className="user-text leading-relaxed text-ink">
                  {r.body}
                </p>
                <time className="mt-2 block text-xs text-stone-faint">
                  {new Date(r.created_at).toLocaleDateString("ko-KR")}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-stone">
            아직 감상이 없어요. 첫 감상을 남겨보세요.
          </p>
        )}

        {user ? (
          <ReflectionForm sentenceId={id} />
        ) : (
          <Link
            href="/login"
            className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
          >
            로그인하고 감상 남기기
          </Link>
        )}
      </section>

      <Link
        href="/"
        className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 목록으로 돌아가기
      </Link>
    </main>
  );
}
