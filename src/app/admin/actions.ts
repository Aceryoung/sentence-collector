"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";

/** 관리자 전용: 문장 소프트 삭제 */
export async function adminDeleteSentence(sentenceId: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "권한이 없습니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("sentences")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", sentenceId)
    .is("deleted_at", null);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

/** 관리자 전용: 삭제된 문장 복원 */
export async function adminRestoreSentence(sentenceId: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "권한이 없습니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("sentences")
    .update({ deleted_at: null })
    .eq("id", sentenceId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

/** 관리자 전용: 오늘의 단어 등록 */
export async function addDailyWord(
  word: string,
  description: string | null,
  scheduledDate: string,
) {
  const admin = await getAdminUser();
  if (!admin) return { error: "권한이 없습니다." };

  const supabase = await createClient();
  const { error } = await supabase.from("daily_words").insert({
    word,
    description,
    scheduled_date: scheduledDate,
  });

  if (error) {
    if (error.code === "23505") return { error: "해당 날짜에 이미 단어가 등록되어 있습니다." };
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/daily-word");
  return { success: true };
}

/** 관리자 전용: 오늘의 단어 대량 등록 (마지막 예약일 다음날부터 자동 배정) */
export async function bulkAddDailyWords(words: string[]) {
  const admin = await getAdminUser();
  if (!admin) return { error: "권한이 없습니다." };
  if (words.length === 0) return { error: "단어를 입력해주세요." };
  if (words.length > 365) return { error: "한 번에 365개까지만 등록 가능합니다." };

  const supabase = await createClient();

  const { data: lastWord } = await supabase
    .from("daily_words")
    .select("scheduled_date")
    .order("scheduled_date", { ascending: false })
    .limit(1)
    .single();

  const today = new Date().toISOString().split("T")[0];
  const startDate = new Date(
    lastWord?.scheduled_date && lastWord.scheduled_date >= today
      ? lastWord.scheduled_date
      : today,
  );

  const rows = words.map((word, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i + 1);
    return {
      word: word.trim(),
      scheduled_date: date.toISOString().split("T")[0],
    };
  });

  const { error } = await supabase.from("daily_words").insert(rows);

  if (error) {
    if (error.code === "23505") return { error: "일부 날짜에 이미 단어가 등록되어 있습니다." };
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/daily-word");
  return { success: true, count: rows.length };
}

/** 관리자 전용: 오늘의 단어 삭제 */
export async function deleteDailyWord(id: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "권한이 없습니다." };

  const supabase = await createClient();
  const { error } = await supabase.from("daily_words").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/daily-word");
  return { success: true };
}
