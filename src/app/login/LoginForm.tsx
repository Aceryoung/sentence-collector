"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/lib/validation";
import { resolvePostLoginPath } from "@/lib/post-login";
import { EMAIL_DOMAINS, applyEmailDomain } from "@/lib/email-domain";

type Status = "idle" | "sending" | "sent" | "error";
type Mode = "link" | "password";

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
  const [mode, setMode] = useState<Mode>("link");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);

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

  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setStatus("error");
      setMessage("이메일 형식을 확인해주세요.");
      return;
    }

    setStatus("sending");
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setStatus("error");
      // 어떤 계정이 존재하는지 알려주지 않기 위해 이메일 오류와 비밀번호
      // 오류를 구분하지 않는다.
      setMessage("이메일 또는 비밀번호가 올바르지 않아요.");
      return;
    }

    window.location.assign("/");
  }

  async function handleResetRequest() {
    if (!isValidEmail(email)) {
      setStatus("error");
      setMessage("이메일을 먼저 입력해주세요.");
      return;
    }

    setStatus("sending");
    setMessage(null);

    const supabase = createClient();
    // 재설정 링크로 들어오면 복구 세션이 붙으므로, 콜백을 거쳐 설정 화면으로
    // 보내면 거기서 새 비밀번호를 저장할 수 있다.
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    });

    if (error) {
      setStatus("error");
      setMessage("재설정 메일 전송에 실패했어요, 잠시 후 다시 시도해주세요.");
      return;
    }

    setStatus("idle");
    setResetSent(true);
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVerifying(true);
    setCodeError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });

    if (error) {
      setVerifying(false);
      setCodeError("코드가 올바르지 않거나 만료됐어요.");
      return;
    }

    // 코드로 들어온 사람은 비밀번호가 없어 다음에도 코드를 또 받아야 한다.
    window.location.assign(resolvePostLoginPath(data.user?.user_metadata));
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

  const isPasswordMode = mode === "password";

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={isPasswordMode ? handlePasswordLogin : handleSubmit}
        className="flex flex-col gap-3"
      >
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

        {/* 모바일에서 "@naver.com"을 직접 치면 오타가 나기 쉽고, 오타가 나면
            메일이 안 오는 이유를 사용자가 알 수 없다. */}
        <div className="flex flex-wrap gap-1.5">
          {EMAIL_DOMAINS.map((domain) => (
            <button
              key={domain}
              type="button"
              onClick={() => setEmail(applyEmailDomain(email, domain))}
              disabled={status === "sending"}
              className="border border-hairline-strong px-2 py-1 font-mono text-xs text-stone hover:border-archive hover:text-ink disabled:opacity-60"
            >
              @{domain}
            </button>
          ))}
        </div>

        {isPasswordMode ? (
          <>
            <label
              htmlFor="password"
              className="font-mono text-xs uppercase tracking-wide text-stone"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
              disabled={status === "sending"}
            />
          </>
        ) : null}

        {/* 자리를 항상 비워둔다 — 조건부로 넣고 빼면 에러가 뜰 때 버튼이 아래로
            밀려서, 다시 누르려던 손가락이 빗나간다. */}
        <p
          role="status"
          aria-live="polite"
          className="min-h-4 font-mono text-xs text-archive"
        >
          {resetSent
            ? "비밀번호 재설정 메일을 보냈어요. 메일함을 확인해주세요."
            : message}
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="border-none bg-archive px-3 py-3 font-mono text-sm text-archive-contrast disabled:opacity-60"
        >
          {status === "sending"
            ? isPasswordMode
              ? "확인하는 중…"
              : "보내는 중…"
            : isPasswordMode
              ? "로그인"
              : "로그인 링크 받기"}
        </button>
      </form>

      {/* 매직링크를 기본으로 두고 비밀번호는 선택 경로로 남긴다 — 비밀번호는
          설정한 사람만 쓸 수 있고, 처음 오는 사람에게는 계정이 없기 때문이다. */}
      <div className="flex flex-col items-start gap-2 font-mono text-xs text-stone">
        <button
          type="button"
          onClick={() => {
            setMode(isPasswordMode ? "link" : "password");
            setMessage(null);
            setResetSent(false);
            setStatus("idle");
          }}
          className="underline underline-offset-4 hover:text-ink"
        >
          {isPasswordMode
            ? "메일로 로그인 링크 받기"
            : "비밀번호로 로그인"}
        </button>
        {isPasswordMode ? (
          <button
            type="button"
            onClick={handleResetRequest}
            disabled={status === "sending"}
            className="underline underline-offset-4 hover:text-ink disabled:opacity-60"
          >
            비밀번호를 잊으셨나요?
          </button>
        ) : null}
      </div>
    </div>
  );
}
