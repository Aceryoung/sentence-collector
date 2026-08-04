"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { PASSWORD_MIN_LENGTH, validatePassword } from "@/lib/validation";

// 로그인 직후 안내 흐름에서는 저장하고 나면 갈 곳이 있어야 한다. 그냥 두면
// "저장했어요"만 남고 다음 행동이 없는 막다른 화면이 된다.
export function PasswordForm({ redirectOnSuccess }: { redirectOnSuccess?: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);

    const invalid = validatePassword(password);
    if (invalid) {
      setMessage(invalid);
      return;
    }

    if (password !== confirm) {
      setMessage("두 비밀번호가 서로 달라요.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    // Supabase는 "비밀번호가 설정됐는지"를 알려주는 필드를 주지 않는다.
    // 로그인 후 설정 안내를 띄울지 판단하려고 우리가 직접 표시를 남긴다.
    const { error } = await supabase.auth.updateUser({
      password,
      data: { has_password: true, password_prompt_seen: true },
    });
    setSaving(false);

    if (error) {
      setMessage("비밀번호 저장에 실패했어요, 잠시 후 다시 시도해주세요.");
      return;
    }

    setPassword("");
    setConfirm("");
    setSaved(true);

    if (redirectOnSuccess) {
      window.location.assign(redirectOnSuccess);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-lg text-ink">비밀번호</h2>
        <p className="font-mono text-xs text-stone-faint">
          설정해두면 다른 기기에서도 메일 없이 바로 로그인할 수 있어요.
          {PASSWORD_MIN_LENGTH}자 이상.
        </p>
      </div>

      <label
        htmlFor="new-password"
        className="font-mono text-xs uppercase tracking-wide text-stone"
      >
        새 비밀번호
      </label>
      <input
        id="new-password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
        disabled={saving}
      />

      <label
        htmlFor="confirm-password"
        className="font-mono text-xs uppercase tracking-wide text-stone"
      >
        한 번 더
      </label>
      <input
        id="confirm-password"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        className="border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
        disabled={saving}
      />

      {/* 자리를 항상 비워둬 메시지가 뜰 때 버튼이 밀리지 않게 한다. */}
      <p
        role="status"
        aria-live="polite"
        className={`min-h-4 font-mono text-xs ${saved ? "text-stone" : "text-archive"}`}
      >
        {saved ? "비밀번호를 저장했어요." : message}
      </p>

      <button
        type="submit"
        disabled={saving}
        className="border-none bg-archive px-3 py-3 font-mono text-sm text-archive-contrast disabled:opacity-60"
      >
        {saving ? "저장하는 중…" : "비밀번호 저장"}
      </button>
    </form>
  );
}
