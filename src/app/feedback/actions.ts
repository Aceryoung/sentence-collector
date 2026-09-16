"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitFeedback(
  category: string,
  body: string,
  pageUrl: string | null,
) {
  if (!["bug", "suggestion", "general"].includes(category))
    return { error: "카테고리를 선택해주세요." };

  const trimmed = body.trim();
  if (trimmed.length < 5) return { error: "5자 이상 입력해주세요." };
  if (trimmed.length > 2000) return { error: "2000자 이내로 입력해주세요." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    category,
    body: trimmed,
    page_url: pageUrl,
  });

  if (error) return { error: error.message };
  return { success: true };
}
