"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/lib/validation";

type Status = "idle" | "sending" | "sent" | "error";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(
    initialError === "expired"
      ? "링크가 만료됐어요, 다시 요청해주세요."
      : null,
  );
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setStatus("error");
      setMessage("이메일 형식을 확인해주세요.");
      return;
    }

    setStatus("sending");
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage("링크 전송에 실패했어요, 잠시 후 다시 시도해주세요.");
      return;
    }

    setStatus("sent");
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVerifying(true);
    setCodeError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });

    if (error) {
      setVerifying(false);
      setCodeError("코드가 올바르지 않거나 만료됐어요.");
      return;
    }

    window.location.assign("/");
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col gap-5">
        <p className="font-mono text-sm text-stone">
          메일함을 확인해주세요. {email}로 로그인 링크와 인증 코드를 보냈어요.
        </p>
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
          <label
            htmlFor="code"
            className="font-mono text-xs uppercase tracking-wide text-stone"
          >
            다른 기기/브라우저라면 인증 코드 입력
          </label>
          {/* 코드 자릿수는 Supabase 대시보드 설정에 따라 달라진다(실제로 8자리가
              발송되는 걸 확인함). 특정 자릿수를 UI에 박아두면 설정이 바뀔 때
              조용히 입력이 잘리므로 상한만 넉넉히 둔다. */}
          <input
            id="code"
            inputMode="numeric"
            maxLength={10}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="메일로 받은 숫자"
            className="border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
            disabled={verifying}
          />
          <p
            role="status"
            aria-live="polite"
            className="min-h-4 font-mono text-xs text-archive"
          >
            {codeError}
          </p>
          <button
            type="submit"
            disabled={verifying}
            className="border-none bg-archive px-3 py-3 font-mono text-sm text-archive-contrast disabled:opacity-60"
          >
            {verifying ? "확인하는 중…" : "코드로 로그인"}
          </button>
        </form>
        {/* 코드 화면이 막다른 골목이 되지 않게 한다 — 주소를 잘못 적었거나
            메일이 안 오면 되돌아갈 방법이 없어 새로고침해야 했다. */}
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setCode("");
            setCodeError(null);
          }}
          className="self-start font-mono text-xs text-stone underline underline-offset-4 hover:text-ink"
        >
          메일이 안 왔거나 주소를 잘못 썼나요? 다시 받기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label
        htmlFor="email"
        className="font-mono text-xs uppercase tracking-wide text-stone"
      >
        이메일
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
        disabled={status === "sending"}
      />
      {/* 자리를 항상 비워둔다 — 조건부로 넣고 빼면 에러가 뜰 때 버튼이 아래로
          밀려서, 다시 누르려던 손가락이 빗나간다. */}
      <p
        role="status"
        aria-live="polite"
        className="min-h-4 font-mono text-xs text-archive"
      >
        {message}
      </p>
      <button
        type="submit"
        disabled={status === "sending"}
        className="border-none bg-archive px-3 py-3 font-mono text-sm text-archive-contrast disabled:opacity-60"
      >
        {status === "sending" ? "보내는 중…" : "로그인 링크 받기"}
      </button>
    </form>
  );
}
