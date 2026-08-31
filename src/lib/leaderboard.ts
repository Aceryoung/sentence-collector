import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type LeaderboardEntry = {
  rank: number;
  displayName: string;
  practiceCount: number;
  isCurrentUser: boolean;
};

/**
 * 전체 필사 횟수 기준 상위 N명을 반환한다.
 * Supabase RPC(get_leaderboard)를 호출하여 user_id를 노출하지 않고
 * 집계 결과만 받는다.
 */
export async function getLeaderboard(
  supabase: SupabaseServerClient,
  currentUserId: string | null,
  limit = 5,
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc("get_leaderboard", {
    current_user_id: currentUserId,
    result_limit: limit,
  });

  if (error || !data) return [];

  return (data as Array<{
    rank: number;
    display_name: string;
    practice_count: number;
    is_current_user: boolean;
  }>).map((row) => ({
    rank: row.rank,
    displayName: row.display_name,
    practiceCount: row.practice_count,
    isCurrentUser: row.is_current_user,
  }));
}
