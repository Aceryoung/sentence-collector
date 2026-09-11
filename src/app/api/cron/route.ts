import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase DB Keep-Alive
 *
 * 매일 KST 9시(UTC 0시)에 GitHub Actions가 호출합니다.
 * 간단한 SELECT 쿼리로 Supabase free tier 일시정지를 방지합니다.
 *
 * 보안: CRON_SECRET 헤더 검증
 */
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  const a = Buffer.from(authHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sentences")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Cron DB ping failed:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "DB keep-alive ping successful",
      timestamp: new Date().toISOString(),
      rowsFound: data?.length ?? 0,
    });
  } catch (err) {
    console.error("Cron unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
