import type { createClient } from "@/lib/supabase/server";
import { SENTENCE_WITH_LIKE_COUNT_SELECT, toSentenceCardData, type SentenceCardData } from "./sentences";
import { getDeviceId } from "./device-id";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * 사용자의 좋아요/필사 기록에서 선호 태그를 추출한다.
 * device_id 기반 likes + user_id 기반 practice_logs를 합산한다.
 */
async function getPreferredTags(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<string[]> {
  // 사용자가 필사한 문장 ID 조회
  const { data: practiceLogs } = await supabase
    .from("practice_logs")
    .select("sentence_id")
    .eq("user_id", userId)
    .limit(50);

  const practiceIds = (practiceLogs ?? []).map((r) => r.sentence_id as string);

  if (practiceIds.length === 0) return [];

  // 해당 문장들의 태그 조회
  const { data: taggedSentences } = await supabase
    .from("sentences")
    .select("emotion_tag")
    .in("id", practiceIds)
    .not("emotion_tag", "is", null);

  if (!taggedSentences || taggedSentences.length === 0) return [];

  // 태그별 빈도 집계
  const tagCounts = new Map<string, number>();
  for (const row of taggedSentences) {
    const tag = row.emotion_tag as string;
    tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }

  // 빈도 순으로 상위 3개
  return [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
}

/**
 * 로그인한 사용자에게 맞춤 추천 문장을 반환한다.
 * 선호 태그 기반으로 최신 문장 중 아직 안 본(필사 안 한) 것을 추천한다.
 * 선호 태그가 없으면 인기순(좋아요 많은 순)으로 폴백한다.
 */
export async function getPersonalizedRecommendations(
  supabase: SupabaseServerClient,
  userId: string,
  excludeIds: string[] = [],
  limit = 3,
): Promise<{ sentences: SentenceCardData[]; reason: string }> {
  const preferredTags = await getPreferredTags(supabase, userId);

  if (preferredTags.length > 0) {
    // 선호 태그 기반 추천
    let query = supabase
      .from("sentences")
      .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
      .is("deleted_at", null)
      .in("emotion_tag", preferredTags)
      .neq("author_id", userId);

    if (excludeIds.length > 0) {
      // Supabase JS에서 not in은 직접 지원하지 않으므로 필터 후 처리
    }

    const { data } = await query
      .order("created_at", { ascending: false })
      .limit(limit + excludeIds.length);

    const sentences = (data ?? [])
      .map(toSentenceCardData)
      .filter((s) => !excludeIds.includes(s.id))
      .slice(0, limit);

    if (sentences.length > 0) {
      const tagLabel = preferredTags.slice(0, 2).join(", ");
      return { sentences, reason: `${tagLabel} 관련 추천` };
    }
  }

  // 폴백: 인기 문장
  const { data } = await supabase
    .from("sentences")
    .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  const all = (data ?? []).map(toSentenceCardData);

  // 좋아요 많은 순으로 정렬 후 제외 처리
  const sorted = all
    .filter((s) => !excludeIds.includes(s.id))
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, limit);

  return { sentences: sorted, reason: "인기 문장" };
}
