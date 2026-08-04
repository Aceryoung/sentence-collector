/**
 * 로그인 화면에서 한 번에 고를 수 있는 이메일 도메인.
 *
 * 모바일에서 "@naver.com"을 직접 치는 건 오타가 나기 쉽고, 오타가 나면
 * 메일이 오지 않는 이유를 사용자가 알 수 없다. 자주 쓰는 것만 짧게 둔다.
 */
export const EMAIL_DOMAINS = [
  "naver.com",
  "gmail.com",
  "daum.net",
  "kakao.com",
  "nate.com",
] as const;

/**
 * 입력 중인 주소에 도메인을 적용한다. 이미 도메인이 있으면 갈아끼운다 —
 * 잘못 고른 사람이 지우고 다시 고르게 만들지 않기 위해서다.
 */
export function applyEmailDomain(current: string, domain: string): string {
  // @가 여러 개여도 첫 번째만 구분자로 본다.
  const localPart = current.split("@")[0].trim();
  return `${localPart}@${domain}`;
}
