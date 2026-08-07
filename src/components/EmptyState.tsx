import { BrandMascot } from "@/components/BrandMascot";

/**
 * 빈 상태.
 *
 * 마스코트는 페이지의 주된 빈 상태에만 쓴다. 검색 결과 없음이나 하위 목록까지
 * 매번 캐릭터를 세우면 금세 소음이 되고, 문장을 읽으러 온 화면의 정서를 깎는다.
 */
export function EmptyState({
  message,
  action,
  withMascot = false,
}: {
  message: string;
  action?: React.ReactNode;
  withMascot?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      {/* 마스코트를 아카이브 브라운으로 두면 아래 CTA 버튼과 강조가 둘로 갈린다.
          중립색으로 두고 강조는 버튼 하나만 가져간다. */}
      {withMascot ? (
        <BrandMascot className="h-24 w-[71px] text-stone" />
      ) : null}
      <p className="text-center font-mono text-sm text-stone">{message}</p>
      {action}
    </div>
  );
}
