/**
 * 로그인 직후 어디로 보낼지 정한다.
 *
 * 매직링크나 인증 코드로 들어온 사람은 비밀번호가 없어서 다음에도 또 메일을
 * 받아야 한다. 그 사실을 알 방법이 로그인 순간 말고는 없으므로, 아직 비밀번호를
 * 설정하지 않았고 안내를 본 적도 없다면 설정 화면으로 한 번 보낸다.
 *
 * Supabase는 비밀번호 설정 여부를 알려주는 필드를 제공하지 않아 우리가
 * user_metadata에 남긴 표시를 읽는다. UI 안내용이라 위조돼도 위험하지 않다.
 */
export type LoginUserMetadata = {
  has_password?: boolean;
  password_prompt_seen?: boolean;
};

export const PASSWORD_SETUP_PATH = "/settings?setup=1";

export function resolvePostLoginPath(
  metadata: LoginUserMetadata | undefined,
  explicitNext?: string,
): string {
  // 재설정 링크처럼 목적지가 정해진 흐름에는 끼어들지 않는다.
  // "/"는 콜백의 기본값이라 목적지 없음과 같게 본다.
  if (explicitNext && explicitNext !== "/") return explicitNext;

  if (metadata?.password_prompt_seen) return "/";
  return PASSWORD_SETUP_PATH;
}
