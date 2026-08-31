"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function joinChallenge(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const challengeId = formData.get("challengeId") as string;

  // UUID 형식 검증
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!challengeId || !uuidRegex.test(challengeId)) {
    redirect("/challenges");
  }

  await supabase
    .from("challenge_participants")
    .upsert(
      { challenge_id: challengeId, user_id: user.id, progress: 0 },
      { onConflict: "challenge_id,user_id" },
    );

  redirect(`/challenges/${challengeId}`);
}
