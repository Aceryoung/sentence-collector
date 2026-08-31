"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleReflectionLike(
  reflectionId: string,
  action: "like" | "unlike",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  if (action === "like") {
    await supabase
      .from("reflection_likes")
      .insert({ reflection_id: reflectionId, user_id: user.id });
  } else {
    await supabase
      .from("reflection_likes")
      .delete()
      .eq("reflection_id", reflectionId)
      .eq("user_id", user.id);
  }

  revalidatePath(`/sentences/`);
}
