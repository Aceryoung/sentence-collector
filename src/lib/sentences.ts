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
