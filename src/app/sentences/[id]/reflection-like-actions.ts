"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleReflectionLike(
  reflectionId: string,
  sentenceId: string,
  action: "like" | "unlike",
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요해요." };

  if (action === "like") {
    const { error } = await supabase
      .from("reflection_likes")
      .insert({ reflection_id: reflectionId, user_id: user.id });
    if (error && error.code !== "23505") {
      return { error: "좋아요에 실패했어요." };
    }
  } else {
    const { error } = await supabase
      .from("reflection_likes")
      .delete()
      .eq("reflection_id", reflectionId)
      .eq("user_id", user.id);
    if (error) {
      return { error: "좋아요 취소에 실패했어요." };
    }
  }

  revalidatePath(`/sentences/${sentenceId}`);
  return { error: null };
}
