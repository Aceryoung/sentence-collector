"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertUserTag(sentenceId: string, emotionTag: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  if (!emotionTag || emotionTag.length > 20)
    return { error: "태그를 선택해주세요." };

  const { error } = await supabase.from("sentence_user_tags").upsert(
    {
      sentence_id: sentenceId,
      user_id: user.id,
      emotion_tag: emotionTag,
    },
    { onConflict: "sentence_id,user_id" },
  );

  if (error) return { error: error.message };

  revalidatePath(`/sentences/${sentenceId}`);
  return { success: true };
}
