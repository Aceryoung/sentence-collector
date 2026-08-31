"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFollow(
  targetUserId: string,
  action: "follow" | "unfollow",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };
  if (user.id === targetUserId) return { error: "자기 자신을 팔로우할 수 없어요." };

  // UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(targetUserId)) {
    return { error: "잘못된 요청입니다." };
  }

  if (action === "follow") {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: targetUserId });
    if (error) {
      // duplicate is fine
      if (error.code !== "23505") {
        console.error("[toggleFollow] insert failed:", error.message);
        return { error: "팔로우에 실패했어요." };
      }
    }
  } else {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId);
    if (error) {
      console.error("[toggleFollow] delete failed:", error.message);
      return { error: "언팔로우에 실패했어요." };
    }
  }

  revalidatePath("/u", "layout");
  return { error: null };
}
