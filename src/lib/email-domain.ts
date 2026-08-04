/**
 * 로그인 화면의 이메일 입력은 "아이디 @ 도메인 [드롭다운]" 형태로 나눈다.
 *
 * 모바일에서 "@naver.com"을 직접 치면 오타가 나기 쉽고, 오타가 나면 메일이
 * 오지 않는 이유를 사용자가 알 수 없다. 국내 서비스에서 익숙한 형태이기도 하다.
 */
export const EMAIL_DOMAINS = [
  "naver.com",
  "gmail.com",
  "daum.net",
  "kakao.com",
  "nate.com",
  "hanmail.net",
] as const;

/** 드롭다운에서 목록에 없는 도메인을 직접 치겠다는 선택지. */
export const DIRECT_INPUT = "직접입력";

/**
 * 나뉜 두 입력칸을 하나의 이메일 주소로 합친다.
 *
 * 칸이 둘로 나뉘어 있어도 습관적으로 @를 같이 치거나 전체 주소를 붙여넣는
 * 사람이 있어서, 양쪽 모두 첫 @ 앞부분만 남긴다. 비어 있어도 그대로 합쳐
 * 이메일 형식 검증이 잡도록 둔다.
 */
export function composeEmail(localPart: string, domain: string): string {
  const local = localPart.trim().split("@")[0];
  const host = domain.trim().replace(/^@+/, "").split("@")[0];
  return `${local}@${host}`;
}
