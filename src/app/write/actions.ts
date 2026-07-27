"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateSentenceBody, validateSource } from "@/lib/validation";

export type CreateSentenceState = {
  error: string | null;
};

export async function createSentence(
  _prevState: CreateSentenceState,
  formData: FormData,
): Promise<CreateSentenceState> {
  const body = String(formData.get("body") ?? "");
  const source = String(formData.get("source") ?? "");

  const bodyError = validateSentenceBody(body);
  if (bodyError) return { error: bodyError };

  const sourceError = validateSource(source);
  if (sourceError) return { error: sourceError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("sentences").insert({
    author_id: user.id,
    body: body.trim(),
    source: source.trim() || null,
  });

  if (error) {
    return { error: "등록에 실패했어요, 잠시 후 다시 시도해주세요." };
  }

  revalidatePath("/");
  revalidatePath("/my");
  redirect("/my");
}
