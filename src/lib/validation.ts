const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
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
