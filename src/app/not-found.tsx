import Link from "next/link";
import { BrandMascot } from "@/components/BrandMascot";

/**
 * 커스텀 404 페이지.
 *
 * Next.js 기본 영문 404 대신 한국어 메시지를 보여준다.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <BrandMascot className="h-20 w-[59px] text-stone" />

      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-lg font-bold text-ink">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-sm leading-relaxed text-stone">
          요청하신 페이지가 존재하지 않거나
          <br />
          주소가 변경되었을 수 있어요.
        </p>
      </div>

      <Link
        href="/"
        className="rounded-[var(--radius-pill)] bg-cta px-5 py-2.5 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
