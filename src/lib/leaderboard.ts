import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type LeaderboardEntry = {
  rank: number;
  /** 이메일 앞부분만 마스킹해서 보여준다 (예: q***) */
  displayName: string;
  practiceCount: number;
  isCurrentUser: boolean;
};

/** 이메일을 마스킹한다. "hello@gmail.com" → "h***" */
function maskEmail(email: string): string {
  const local = email.split("@")[0];
  if (local.length <= 1) return `${local}***`;
  return `${local[0]}${"*".repeat(Math.min(local.length - 1, 3))}`;
}

/**
 * 전체 필사 횟수 기준 상위 N명을 반환한다.
 * practice_logs는 user_id + date 유니크이므로 count = 필사 일수와 같다.
 */
export async function getLeaderboard(
  supabase: SupabaseServerClient,
  currentUserId: string | null,
  limit = 5,
): Promise<LeaderboardEntry[]> {
  // practice_logs를 user_id별로 집계 — Supabase JS에서는
  // group by가 안 되므로 rpc나 raw sql을 쓰거나, 모든 로그를 가져와
  // 클라이언트에서 집계한다. 데이터 규모가 작으므로 후자가 안전하다.
  // 더 나은 방법: Supabase에 view나 rpc를 만드는 것이지만
  // 지금은 practice_logs에서 직접 가져온다.
  const { data: logs } = await supabase
    .from("practice_logs")
    .select("user_id");

  if (!logs || logs.length === 0) return [];

  // user_id별 필사 횟수 집계
  const counts = new Map<string, number>();
  for (const log of logs) {
    counts.set(log.user_id, (counts.get(log.user_id) ?? 0) + 1);
  }

  // 상위 N명 추출
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  // 사용자 이메일 조회 — auth.users는 직접 조회 불가하므로
  // 대안: 익명 랭킹 (순위 + 필사 횟수만 보여준다)
  // 하지만 현재 유저가 본인인지는 user_id로 판별 가능
  const userIds = sorted.map(([id]) => id);

  // 이메일 없이 순위만 보여주되, 본인은 표시
  const entries: LeaderboardEntry[] = sorted.map(([userId, count], i) => ({
    rank: i + 1,
    displayName: userId === currentUserId ? "나" : `필사인 ${i + 1}`,
    practiceCount: count,
    isCurrentUser: userId === currentUserId,
  }));

  return entries;
}
