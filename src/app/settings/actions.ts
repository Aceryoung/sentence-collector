"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PreferencesState = {
  error: string | null;
  success: boolean;
};

export async function updatePreferences(
  _prevState: PreferencesState,
  formData: FormData,
): Promise<PreferencesState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다.", success: false };
  }

  const reminderEnabled = formData.get("reminder_enabled") === "on";
  const reminderHour = parseInt(formData.get("reminder_hour") as string, 10);
  const weeklyReportEnabled = formData.get("weekly_report_enabled") === "on";

  if (isNaN(reminderHour) || reminderHour < 0 || reminderHour > 23) {
    return { error: "알림 시간은 0~23 사이로 입력해주세요.", success: false };
  }

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: user.id,
        reminder_enabled: reminderEnabled,
        reminder_hour: reminderHour,
        weekly_report_enabled: weeklyReportEnabled,
      },
      { onConflict: "user_id" },
    );

  if (error) {
    console.error("[updatePreferences] failed:", error.message);
    return { error: "설정 저장에 실패했어요.", success: false };
  }

  revalidatePath("/settings");
  return { error: null, success: true };
}

export type NicknameState = {
  error: string | null;
  success: boolean;
};

export async function updateNickname(
  _prevState: NicknameState,
  formData: FormData,
): Promise<NicknameState> {
  const nickname = (formData.get("nickname") as string | null)?.trim() ?? "";

  if (nickname.length > 20) {
    return { error: "닉네임은 20자 이내로 입력해주세요.", success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다.", success: false };
  }

  const { error } = await supabase.auth.updateUser({
    data: { nickname: nickname || null },
  });

  if (error) {
    console.error("[updateNickname] failed:", error.message);
    return { error: "닉네임 저장에 실패했어요. 잠시 후 다시 시도해주세요.", success: false };
  }

  revalidatePath("/", "layout");
  return { error: null, success: true };
}
