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

  await supabase
    .from("challenge_participants")
    .upsert(
      { challenge_id: challengeId, user_id: user.id, progress: 0 },
      { onConflict: "challenge_id,user_id" },
    );

  redirect(`/challenges/${challengeId}`);
}
