import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SENTENCE_WITH_LIKE_COUNT_SELECT, toSentenceCardData } from "@/lib/sentences";
import { SentenceCard } from "@/components/SentenceCard";
import { FollowButton } from "./FollowButton";

type PublicProfileData = {
  user_id: string;
  nickname: string;
  joined_at: string;
  practice_count: number;
  sentence_count: number;
  public_collections: { id: string; title: string; item_count: number }[];
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ nickname: string }>;
}) {
  const { nickname } = await params;
  let decodedNickname: string;
  try {
    decodedNickname = decodeURIComponent(nickname);
  } catch {
    notFound();
  }
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_public_profile", {
    target_nickname: decodedNickname,
  });

  if (error || !data) notFound();

  const profile = data as unknown as PublicProfileData;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 본인 프로필이면 팔로우 버튼 숨김
  const isSelf = user?.id === profile.user_id;

  // 팔로우 상태, 카운트, 최근 문장을 병렬 조회
  const [followResult, { count: followerCount }, { count: followingCount }, { data: recentSentences }] =
    await Promise.all([
      user && !isSelf
        ? supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", profile.user_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile.user_id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile.user_id),
      supabase
        .from("sentences")
        .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
        .eq("author_id", profile.user_id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);
  const isFollowing = !!followResult.data;

  const sentences = (recentSentences ?? []).map(toSentenceCardData);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      {/* 프로필 헤더 */}
      <section className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-archive/10 font-serif text-2xl font-bold text-archive">
          {profile.nickname.charAt(0).toUpperCase()}
        </div>
        <h1 className="font-serif text-2xl font-bold text-ink">
          {profile.nickname}
        </h1>
        <div className="flex items-center gap-4 text-sm text-stone">
          <span>
            필사 <strong className="text-ink">{profile.practice_count}</strong>
          </span>
          <span>
            문장 <strong className="text-ink">{profile.sentence_count}</strong>
          </span>
          <span>
            팔로워{" "}
            <strong className="text-ink">{followerCount ?? 0}</strong>
          </span>
          <span>
            팔로잉{" "}
            <strong className="text-ink">{followingCount ?? 0}</strong>
          </span>
        </div>
        <p className="text-xs text-stone-faint">
          {new Date(profile.joined_at).toLocaleDateString("ko-KR")}부터 함께
        </p>

        {user && !isSelf ? (
          <FollowButton
            targetUserId={profile.user_id}
            initialFollowing={isFollowing}
          />
        ) : null}
      </section>

      {/* 공개 컬렉션 */}
      {profile.public_collections.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-lg font-bold text-ink">공개 컬렉션</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {profile.public_collections.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/collections/${c.id}`}
                  className="card-lift flex items-center justify-between rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-3 transition-all hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span className="text-sm font-medium text-ink">
                    {c.title}
                  </span>
                  <span className="text-xs tabular-nums text-stone-faint">
                    {c.item_count}개
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 최근 문장 */}
      {sentences.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-lg font-bold text-ink">최근 수집한 문장</h2>
          <ul className="flex flex-col gap-4">
            {sentences.map((s) => (
              <li key={s.id}>
                <SentenceCard {...s} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        href="/"
        className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 홈으로
      </Link>
    </main>
  );
}
