import { createClient } from "@/lib/supabase/server";

/**
 * 현재 로그인 사용자가 관리자인지 확인한다.
 *
 * 관리자 판별: 환경변수 ADMIN_EMAIL과 로그인 이메일 일치 여부.
 * 한 명만 관리자인 소규모 서비스에 적합하다.
 */
export async function getAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== adminEmail) return null;

  return user;
}
