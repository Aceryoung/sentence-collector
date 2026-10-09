"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateSentenceBody, validateSource, validateCommentary, validateEmotionTag } from "@/lib/validation";
import { suggestTags } from "@/lib/claude";

export type CreateSentenceState = {
  error: string | null;
  success?: {
    sentenceId: string;
    suggestedTags: string[];
  };
};

export async function createSentence(
  _prevState: CreateSentenceState,
  formData: FormData,
): Promise<CreateSentenceState> {
  const body = String(formData.get("body") ?? "");
  const source = String(formData.get("source") ?? "");
  const commentary = String(formData.get("commentary") ?? "");
  const emotionTag = String(formData.get("emotionTag") ?? "");

  const bodyError = validateSentenceBody(body);
  if (bodyError) return { error: bodyError };

  const sourceError = validateSource(source);
  if (sourceError) return { error: sourceError };

  const emotionTagError = validateEmotionTag(emotionTag);
  if (emotionTagError) return { error: emotionTagError };

  const commentaryError = validateCommentary(commentary);
  if (commentaryError) return { error: commentaryError };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "로그인이 필요합니다." };
    }

    const { data, error } = await supabase.from("sentences").insert({
      author_id: user.id,
      body: body.trim(),
      source: source.trim() || null,
      commentary: commentary.trim() || null,
      emotion_tag: emotionTag,
    }).select("id").single();

    if (error || !data) {
      console.error("[createSentence] insert failed:", error);
      return { error: "등록에 실패했어요, 잠시 후 다시 시도해주세요." };
    }

    revalidatePath("/");
    revalidatePath("/my");

    const suggestedTags = await suggestTags(
      body.trim(),
      source.trim() || null,
      commentary.trim() || null,
    );

    return {
      error: null,
      success: {
        sentenceId: data.id,
        suggestedTags,
      },
    };
  } catch {
    return { error: "일시적인 오류가 발생했어요, 잠시 후 다시 시도해주세요." };
  }
}

export async function acceptSuggestedTags(sentenceId: string, tags: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  for (const tag of tags) {
    await supabase.from("sentence_user_tags").upsert(
      {
        sentence_id: sentenceId,
        user_id: user.id,
        emotion_tag: tag,
      },
      { onConflict: "sentence_id,user_id" },
    );
  }

  revalidatePath(`/sentences/${sentenceId}`);
}
