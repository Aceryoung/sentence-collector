"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getKstDateString } from "@/lib/kst-date";

export type LogPracticeState = {
  error: string | null;
};

export async function logPractice(
  _prevState: LogPracticeState,
  formData: FormData,
): Promise<LogPracticeState> {
  const sentenceId = String(formData.get("sentenceId") ?? "");
  if (!sentenceId) return { error: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: null };

  const typedText = formData.get("typedText") as string | null;
  const accuracyRaw = formData.get("accuracy") as string | null;
  const durationRaw = formData.get("durationSeconds") as string | null;

  const date = getKstDateString(new Date());
  const { error } = await supabase.from("practice_logs").insert({
    user_id: user.id,
    date,
    sentence_id: sentenceId,
    ...(typedText ? { typed_text: typedText } : {}),
    ...(accuracyRaw ? { accuracy: parseFloat(accuracyRaw) } : {}),
    ...(durationRaw ? { duration_seconds: parseInt(durationRaw, 10) } : {}),
  });

  // 23505 = unique(user_id, date) 위반 → 오늘 이미 기록됨, 정상 처리
  if (error && error.code !== "23505") {
    console.error("[logPractice] insert failed:", error.message);
    return { error: "기록에 실패했어요, 잠시 후 다시 시도해주세요." };
  }

  revalidatePath("/practice");
  return { error: null };
}
