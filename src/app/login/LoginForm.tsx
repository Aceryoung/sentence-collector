"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/lib/validation";
import { resolvePostLoginPath } from "@/lib/post-login";
import { DIRECT_INPUT, EMAIL_DOMAINS, composeEmail } from "@/lib/email-domain";

type Status = "idle" | "sending" | "sent" | "error";
type Mode = "link" | "password";

export function LoginForm({ initialError }: { initialError?: string }) {
  // 입력칸을 아이디/도메인으로 나눠 받고 제출 시점에 하나로 합친다.
  const [localPart, setLocalPart] = useState("");
  const [domain, setDomain] = useState("");
  const email = composeEmail(localPart, domain);
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
  // 별도 가입 화면이 없어 첫 로그인이 곧 가입이다. 개인정보 수집·이용 동의와
  // 만 14세 이상 확인을 여기서 받아야 한다(PIPA §22, §22-2).
  const [agreed, setAgreed] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  async function handleGoogleLogin() {
    if (!agreed) {
      setStatus("error");
      setMessage("약관과 개인정보 처리방침에 동의해주세요.");
      return;
    }

    setSocialLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // prompt를 지정하지 않으면 Google이 자동 판단한다:
        // - 계정이 하나면 바로 로그인 (이탈률 감소)
        // - 여러 개면 계정 선택 화면 표시
      },
    });

    if (error) {
      setSocialLoading(false);
      setStatus("error");
      setMessage("Google 로그인에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
    // 성공하면 Google 로그인 페이지로 리다이렉트되므로 로딩 상태를 유지한다.
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setStatus("error");
      setMessage("이메일 형식을 확인해주세요.");
      return;
    }

    if (!agreed) {
      setStatus("error");
      setMessage("약관과 개인정보 처리방침에 동의해주세요.");
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

    if (!agreed) {
      setStatus("error");
      setMessage("약관과 개인정보 처리방침에 동의해주세요.");
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
        <p className="text-sm text-stone">
          메일함을 확인해주세요. {email}로 로그인 링크와 인증 코드를 보냈어요.
        </p>
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
          <label
            htmlFor="code"
            className="text-xs uppercase tracking-wide text-stone"
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
            className="rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
            disabled={verifying}
          />
          <p
            role="status"
            aria-live="polite"
            className="min-h-4 text-xs text-archive"
          >
            {codeError}
          </p>
          <button
            type="submit"
            disabled={verifying}
            className="rounded-[var(--radius-pill)] border-none bg-archive px-3 py-3 text-sm text-archive-contrast transition-all duration-200 hover:shadow-md disabled:opacity-60"
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
          className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
        >
          메일이 안 왔거나 주소를 잘못 썼나요? 다시 받기
        </button>
      </div>
    );
  }

  const isPasswordMode = mode === "password";
  // 목록에 없는 도메인을 직접 쳤으면 드롭다운은 "직접입력"을 가리켜야 한다.
  const domainChoice = (EMAIL_DOMAINS as readonly string[]).includes(domain)
    ? domain
    : DIRECT_INPUT;

  return (
    <div className="flex flex-col gap-4">
      {/* ── 약관 동의 (소셜·이메일 공통) ── */}
      <label className="flex items-start gap-2 text-xs leading-relaxed text-stone">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          disabled={status === "sending" || socialLoading}
          className="mt-0.5 size-4 shrink-0 accent-archive"
        />
        <span>
          만 14세 이상이며,{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-ink"
          >
            이용약관
          </Link>
          과{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-ink"
          >
            개인정보 처리방침
          </Link>
          에 동의합니다.
        </span>
      </label>

      {/* ── Google 소셜 로그인 ── */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={socialLoading}
        className="btn-press flex items-center justify-center gap-3 rounded-[var(--radius-pill)] border border-hairline-strong bg-surface px-3 py-3 text-sm font-medium text-ink transition-all duration-200 hover:border-archive/40 hover:shadow-md disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {socialLoading ? "연결하는 중…" : "Google로 시작하기"}
      </button>

      {/* ── 구분선 ── */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-hairline" />
        <span className="text-xs text-stone-faint">또는 이메일로</span>
        <div className="h-px flex-1 bg-hairline" />
      </div>

      <form
        onSubmit={isPasswordMode ? handlePasswordLogin : handleSubmit}
        className="flex flex-col gap-3"
      >
        <label
          htmlFor="email-local"
          className="text-xs uppercase tracking-wide text-stone"
        >
          이메일
        </label>
        {/* 모바일에서 "@naver.com"을 직접 치면 오타가 나기 쉽고, 오타가 나면
            메일이 안 오는 이유를 사용자가 알 수 없다. min-w-0이 없으면 좁은
            화면에서 입력칸이 내용 폭 밑으로 줄지 못해 가로로 넘친다. */}
        <div className="flex items-center gap-2">
          <input
            id="email-local"
            inputMode="email"
            value={localPart}
            onChange={(event) => setLocalPart(event.target.value)}
            placeholder="아이디"
            className="w-full min-w-0 flex-1 rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
            disabled={status === "sending"}
          />
          <span aria-hidden="true" className="text-sm text-stone">
            @
          </span>
          <input
            id="email-domain"
            aria-label="이메일 도메인"
            inputMode="url"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="도메인"
            className="w-full min-w-0 flex-1 rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
            disabled={status === "sending"}
          />
        </div>
        <select
          aria-label="이메일 도메인 선택"
          value={domainChoice}
          onChange={(event) => {
            const picked = event.target.value;
            // 직접입력을 고르면 칸을 비워 사용자가 바로 칠 수 있게 한다.
            setDomain(picked === DIRECT_INPUT ? "" : picked);
          }}
          className="rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-archive"
          disabled={status === "sending"}
        >
          <option value={DIRECT_INPUT}>{DIRECT_INPUT}</option>
          {EMAIL_DOMAINS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        {isPasswordMode ? (
          <>
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-wide text-stone"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
              disabled={status === "sending"}
            />
          </>
        ) : null}

        {/* 자리를 항상 비워둔다 — 조건부로 넣고 빼면 에러가 뜰 때 버튼이 아래로
            밀려서, 다시 누르려던 손가락이 빗나간다. */}
        <p
          role="status"
          aria-live="polite"
          className="min-h-4 text-xs text-archive"
        >
          {resetSent
            ? "비밀번호 재설정 메일을 보냈어요. 메일함을 확인해주세요."
            : message}
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-[var(--radius-pill)] border-none bg-archive px-3 py-3 text-sm text-archive-contrast transition-all duration-200 hover:shadow-md disabled:opacity-60"
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
      <div className="flex flex-col items-start gap-2 text-xs text-stone">
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
