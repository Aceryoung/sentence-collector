"use server";

import { createClient } from "@/lib/supabase/server";
import {
  SENTENCE_WITH_LIKE_COUNT_SELECT,
  toSentenceCardData,
  type SentenceCardData,
} from "@/lib/sentences";

const PAGE_SIZE = 20;

export async function loadMoreSentences(
  page: number,
  tag?: string | null,
  excludeId?: string | null,
): Promise<{ sentences: SentenceCardData[]; hasMore: boolean }> {
  const supabase = await createClient();
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("sentences")
    .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
    .is("deleted_at", null);

  if (tag) query = query.eq("emotion_tag", tag);

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE);

  const { data } = await query;

  let sentences = (data ?? []).map(toSentenceCardData);
  if (excludeId) {
    sentences = sentences.filter((s) => s.id !== excludeId);
  }

  return {
    sentences,
    hasMore: (data ?? []).length > PAGE_SIZE,
  };
}
