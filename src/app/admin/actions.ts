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
