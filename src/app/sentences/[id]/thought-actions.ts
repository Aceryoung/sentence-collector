"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ThoughtState = { error: string | null; success?: boolean };

export async function addThought(
  _prev: ThoughtState,
  formData: FormData,
): Promise<ThoughtState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요해요." };
  }

  const sentenceId = formData.get("sentenceId") as string;
  const body = (formData.get("body") as string)?.trim();

  if (!body) {
    return { error: "생각을 적어주세요." };
  }

  if (body.length > 500) {
    return { error: "생각은 500자까지 쓸 수 있어요." };
  }

  const { error } = await supabase
    .from("thoughts")
    .insert({ sentence_id: sentenceId, author_id: user.id, body });

  if (error) {
    return { error: "저장에 실패했어요. 잠시 후 다시 시도해주세요." };
  }

  revalidatePath(`/sentences/${sentenceId}`);
  return { error: null, success: true };
}

export async function updateThought(
  _prev: ThoughtState,
  formData: FormData,
): Promise<ThoughtState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요해요." };
  }

  const thoughtId = formData.get("thoughtId") as string;
  const sentenceId = formData.get("sentenceId") as string;
  const body = (formData.get("body") as string)?.trim();

  if (!body) {
    return { error: "생각을 적어주세요." };
  }

  if (body.length > 500) {
    return { error: "생각은 500자까지 쓸 수 있어요." };
  }

  const { error } = await supabase
    .from("thoughts")
    .update({ body, updated_at: new Date().toISOString() })
    .eq("id", thoughtId)
    .eq("author_id", user.id);

  if (error) {
    return { error: "수정에 실패했어요. 잠시 후 다시 시도해주세요." };
  }

  revalidatePath(`/sentences/${sentenceId}`);
  return { error: null, success: true };
}

export async function deleteThought(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const thoughtId = formData.get("thoughtId") as string;
  const sentenceId = formData.get("sentenceId") as string;

  await supabase
    .from("thoughts")
    .delete()
    .eq("id", thoughtId)
    .eq("author_id", user.id);

  revalidatePath(`/sentences/${sentenceId}`);
}
