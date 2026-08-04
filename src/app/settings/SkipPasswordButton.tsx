"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SkipPasswordButton() {
  const [leaving, setLeaving] = useState(false);

  async function handleSkip() {
    setLeaving(true);
    const supabase = createClient();
    // 표시를 남겨야 다음 로그인 때 같은 화면을 또 들이밀지 않는다.
    // 실패하더라도 사용자를 붙잡아둘 이유는 없으니 결과와 무관하게 이동한다.
    await supabase.auth.updateUser({ data: { password_prompt_seen: true } });
    window.location.assign("/");
  }

  return (
    <button
      type="button"
      onClick={handleSkip}
      disabled={leaving}
      className="self-start font-mono text-xs text-stone underline underline-offset-4 hover:text-ink disabled:opacity-60"
    >
      {leaving ? "이동하는 중…" : "나중에 할게요"}
    </button>
  );
}
