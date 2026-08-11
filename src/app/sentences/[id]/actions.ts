"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ReflectionState = { error: string | null };

export async function addReflection(
  _prev: ReflectionState,
  formData: FormData,
): Promise<ReflectionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요해요." };
  }

  const sentenceId = formData.get("sentenceId") as string;
  const body = (formData.get("body") as string)?.trim();

  if (!body || body.length < 10) {
    return { error: "감상은 10자 이상 적어주세요." };
  }

  if (body.length > 500) {
    return { error: "감상은 500자까지 쓸 수 있어요." };
  }

  const { error } = await supabase
    .from("reflections")
    .insert({ sentence_id: sentenceId, author_id: user.id, body });

  if (error) {
    return { error: "감상 등록에 실패했어요. 잠시 후 다시 시도해주세요." };
  }

  redirect(`/sentences/${sentenceId}`);
}
