const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

// Supabase 기본 최소 길이와 맞춘다. 문자 종류 조합은 강제하지 않는다 —
// 길이가 짧은 복잡한 비밀번호보다 긴 비밀번호가 안전하고, 조합 규칙은
// 사용자를 예측 가능한 패턴으로 몰아넣는다.
export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(password: string): string | null {
  // trim하지 않는다 — 공백도 비밀번호의 유효한 문자다.
  if (password.length === 0) return "비밀번호를 입력해주세요.";
  if (password.length < PASSWORD_MIN_LENGTH)
    return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상으로 입력해주세요.`;
  return null;
}

export const SENTENCE_BODY_MAX_LENGTH = 500;
export const SOURCE_MAX_LENGTH = 200;

export function validateSentenceBody(body: string): string | null {
  const trimmed = body.trim();
  if (trimmed.length === 0) return "문장을 입력해주세요.";
  if (trimmed.length > SENTENCE_BODY_MAX_LENGTH)
    return `문장은 ${SENTENCE_BODY_MAX_LENGTH}자 이내로 입력해주세요.`;
  return null;
}

export function validateSource(source: string): string | null {
  if (source.trim().length > SOURCE_MAX_LENGTH)
    return `출처는 ${SOURCE_MAX_LENGTH}자 이내로 입력해주세요.`;
  return null;
}
