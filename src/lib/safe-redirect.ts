/**
 * 인증 콜백의 `next` 파라미터를 안전한 내부 경로로 정규화한다.
 *
 * `next`는 이메일 링크를 타고 들어오는 값이라 공격자가 임의로 넣을 수 있다.
 * 그대로 리다이렉트에 쓰면 우리 도메인 링크가 외부 피싱 사이트로 사용자를
 * 보내는 오픈 리다이렉트가 된다. 허용 목록 방식으로 내부 경로만 통과시킨다.
 */
export function safeNextPath(next: string | null): string {
  if (!next) return "/";

  // 슬래시로 시작하지 않으면 상대 경로거나 "javascript:" 같은 스킴이다.
  if (!next.startsWith("/")) return "/";

  // "//evil.com"은 프로토콜 상대 URL이라 외부로 나간다. 일부 브라우저가
  // 백슬래시를 슬래시로 정규화하므로 "/\evil.com"도 함께 막는다.
  if (next.startsWith("//") || next.startsWith("/\\")) return "/";

  return next;
}
