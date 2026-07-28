import type { createClient } from "@/lib/supabase/server";
import { pickDailyId } from "@/lib/daily-pick";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type SentenceCardData = {
  id: string;
  body: string;
  source: string | null;
  likeCount: number;
};

type RawSentenceRow = {
  id: string;
  body: string;
  source: string | null;
  likes: { count: number }[] | null;
};

export function toSentenceCardData(row: RawSentenceRow): SentenceCardData {
  return {
    id: row.id,
    body: row.body,
    source: row.source,
    likeCount: row.likes?.[0]?.count ?? 0,
  };
}

export const SENTENCE_WITH_LIKE_COUNT_SELECT =
  "id, body, source, created_at, likes(count)";

async function fetchDailyPick(
  supabase: SupabaseServerClient,
  authorId?: string,
): Promise<SentenceCardData | null> {
  let idQuery = supabase
    .from("sentences")
    .select("id")
    .is("deleted_at", null);
  if (authorId) {
    idQuery = idQuery.eq("author_id", authorId);
  }
  const { data: idRows } = await idQuery.order("id", { ascending: true });

  const ids = (idRows ?? []).map((row) => row.id as string);
  const pickedId = pickDailyId(ids, new Date());
  if (!pickedId) return null;

  const { data } = await supabase
    .from("sentences")
    .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
    .eq("id", pickedId)
    .single();

  return data ? toSentenceCardData(data) : null;
}

export function getPersonalDailyPick(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<SentenceCardData | null> {
  return fetchDailyPick(supabase, userId);
}

export function getPublicDailyPick(
  supabase: SupabaseServerClient,
): Promise<SentenceCardData | null> {
  return fetchDailyPick(supabase);
}
