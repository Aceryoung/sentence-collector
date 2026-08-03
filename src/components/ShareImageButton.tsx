"use client";

import { useState, useSyncExternalStore } from "react";
import { renderShareCard } from "@/lib/share-image";

type Props = {
  body: string;
  source: string | null;
};

// navigator.canShare는 런타임 내내 바뀌지 않으므로 구독할 이벤트가 없다.
function subscribeNever() {
  return () => {};
}

export function ShareImageButton({ body, source }: Props) {
  const [error, setError] = useState<string | null>(null);
  // 모바일은 공유 시트가 열리고 데스크톱은 파일이 저장된다 — 실제 결과에 맞게
  // 라벨을 바꾼다. SSR 시점에는 판단할 수 없어 hydration 이후에만 전환한다.
  const canShareFiles = useSyncExternalStore(
    subscribeNever,
    () => typeof navigator !== "undefined" && Boolean(navigator.canShare),
    () => false,
  );

  function handleClick() {
    setError(null);

    const canvas = document.createElement("canvas");
    if (!canvas.getContext || !canvas.toBlob) {
      setError("이 브라우저에서는 이미지 저장을 지원하지 않아요.");
      return;
    }

    const rendered = renderShareCard(canvas, { body, source });
    if (!rendered) {
      setError("이 브라우저에서는 이미지 저장을 지원하지 않아요.");
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        setError("이미지를 만드는 데 실패했어요.");
        return;
      }

      const file = new File([blob], "sentence.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        navigator.share({ files: [file] }).catch(() => {
          // 사용자가 공유를 취소한 경우 — 별도 처리 없음
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sentence.png";
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        className="border border-hairline-strong px-2 py-1 font-mono text-xs text-stone hover:border-archive hover:text-ink"
      >
        {canShareFiles ? "이미지로 공유" : "이미지로 저장"}
      </button>
      {error ? (
        <p className="font-mono text-xs text-archive">{error}</p>
      ) : null}
    </div>
  );
}
