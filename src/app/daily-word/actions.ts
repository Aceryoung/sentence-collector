"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitDailyWordResponse(
  dailyWordId: string,
  body: string,
) {
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 1000) {
    return { error: "1~1000자 이내로 작성해주세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase.from("daily_word_responses").upsert(
    {
      daily_word_id: dailyWordId,
      user_id: user.id,
      body: trimmed,
    },
    { onConflict: "daily_word_id,user_id" },
  );

  if (error) return { error: "저장에 실패했습니다." };

  revalidatePath("/daily-word");
  return { success: true };
}
