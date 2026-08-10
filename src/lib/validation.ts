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
export const COMMENTARY_MIN_LENGTH = 30;
export const COMMENTARY_MAX_LENGTH = 500;

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

/**
 * 나의 감상 검증.
 *
 * 저작권법 제28조 공정인용 요건을 구조적으로 충족하기 위해 이용자 본인의
 * 해석·비평·감상을 30자 이상 필수로 받는다. 원문 인용이 주(主)이고 이용자
 * 창작이 종(從)이 되는 상황을 방지한다.
 */
export function validateCommentary(commentary: string): string | null {
  const trimmed = commentary.trim();
  if (trimmed.length === 0) return "나의 감상을 입력해주세요.";
  if (trimmed.length < COMMENTARY_MIN_LENGTH)
    return `감상은 ${COMMENTARY_MIN_LENGTH}자 이상 입력해주세요.`;
  if (trimmed.length > COMMENTARY_MAX_LENGTH)
    return `감상은 ${COMMENTARY_MAX_LENGTH}자 이내로 입력해주세요.`;
  return null;
}
