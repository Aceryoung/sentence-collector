import type { createClient } from "@/lib/supabase/server";
import { getKstDateString } from "./kst-date";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MS_PER_DAY = 86_400_000;

function toDayNumber(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

// 오늘 아직 필사를 안 했어도 어제까지 이어져 있으면 스트릭을 유지한다(grace day).
// 오늘/어제 둘 다 기록이 없으면 0으로 리셋.
export function computeStreak(loggedDates: string[], today: string): number {
  const days = new Set(loggedDates.map(toDayNumber));
  const todayNum = toDayNumber(today);

  let cursor = days.has(todayNum) ? todayNum : todayNum - 1;
  if (!days.has(cursor)) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

export type UserStreak = {
  streak: number;
  completedToday: boolean;
};

export async function getUserStreak(
  supabase: SupabaseServerClient,
  userId: string,
  now: Date = new Date(),
): Promise<UserStreak> {
  const { data: logs } = await supabase
    .from("practice_logs")
    .select("date")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(400);

  const today = getKstDateString(now);
  const dates = (logs ?? []).map((row) => row.date as string);

  return {
    streak: computeStreak(dates, today),
    completedToday: dates.includes(today),
  };
}
