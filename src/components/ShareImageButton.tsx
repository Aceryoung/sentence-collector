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

let glyphPromise: Promise<HTMLImageElement | undefined> | null = null;

/** 카드마다 다시 받지 않도록 한 번만 불러 재사용한다. */
function loadGlyph(): Promise<HTMLImageElement | undefined> {
  glyphPromise ??= new Promise((resolve) => {
    // viewBox만 있는 SVG는 고유 크기가 없어 브라우저에 따라 래스터화에 실패한다.
    // 크기를 먼저 박아두면 drawImage에서 다시 줄여도 안전하다.
    const image = new Image(1412, 1017);
    image.onload = () => resolve(image);
    image.onerror = () => resolve(undefined);
    image.src = "/brand/geuljeok-glyph.svg";
  });
  return glyphPromise;
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

  async function handleClick() {
    setError(null);

    const canvas = document.createElement("canvas");
    if (!canvas.getContext || !canvas.toBlob) {
      setError("이 브라우저에서는 이미지 저장을 지원하지 않아요.");
      return;
    }

    // 로고를 못 불러와도 저장은 되어야 한다 — 서명만 워드마크로 떨어진다.
    const glyph = await loadGlyph();
    const rendered = renderShareCard(canvas, { body, source }, glyph);
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
        className="rounded-[var(--radius-input)] border border-hairline-strong px-2 py-1 text-xs text-stone hover:border-archive hover:text-ink"
      >
        {canShareFiles ? "이미지로 공유" : "이미지로 저장"}
      </button>
      {error ? (
        <p className="text-xs text-archive">{error}</p>
      ) : null}
    </div>
  );
}
