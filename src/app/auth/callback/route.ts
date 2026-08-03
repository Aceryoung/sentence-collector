import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Vercel 같은 프록시 뒤에서는 request.url의 origin이 공개 주소가 아니라
// 내부 호스트로 잡히거나 https가 http로 떨어질 수 있다. 그러면 로그인 후
// 엉뚱한 주소로 리다이렉트돼 배포 환경에서만 로그인이 깨진다.
function resolveBaseUrl(request: NextRequest, origin: string): string {
  if (process.env.NODE_ENV === "development") return origin;

  const forwardedHost = request.headers.get("x-forwarded-host");
  return forwardedHost ? `https://${forwardedHost}` : origin;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const baseUrl = resolveBaseUrl(request, origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${baseUrl}/`);
    }

    console.error("[auth/callback] exchangeCodeForSession failed:", error);
  }

  // 코드가 없거나 교환에 실패 — 링크가 만료됐거나 이미 사용된 경우
  return NextResponse.redirect(`${baseUrl}/login?error=expired`);
}
