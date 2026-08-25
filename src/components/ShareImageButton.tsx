"use client";

import { useRef, useState, useEffect, useSyncExternalStore } from "react";
import { renderShareCard, renderWallpaper } from "@/lib/share-image";
import { useToast } from "@/components/Toast";

type Props = {
  body: string;
  source: string | null;
};

function subscribeNever() {
  return () => {};
}

let glyphPromise: Promise<HTMLImageElement | undefined> | null = null;

function loadGlyph(): Promise<HTMLImageElement | undefined> {
  glyphPromise ??= new Promise((resolve) => {
    const image = new Image(1412, 1017);
    image.onload = () => resolve(image);
    image.onerror = () => resolve(undefined);
    image.src = "/brand/geuljeok-glyph.svg";
  });
  return glyphPromise;
}

type ImageMode = "card" | "wallpaper";

export function ShareImageButton({ body, source }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const canShareFiles = useSyncExternalStore(
    subscribeNever,
    () => typeof navigator !== "undefined" && Boolean(navigator.canShare),
    () => false,
  );

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleGenerate(mode: ImageMode) {
    setOpen(false);

    const canvas = document.createElement("canvas");
    if (!canvas.getContext || !canvas.toBlob) {
      toast("이 브라우저에서는 이미지 저장을 지원하지 않아요.", "error");
      return;
    }

    const glyph = await loadGlyph();
    const rendered =
      mode === "wallpaper"
        ? renderWallpaper(canvas, { body, source }, glyph)
        : renderShareCard(canvas, { body, source }, glyph);

    if (!rendered) {
      toast("이 브라우저에서는 이미지 저장을 지원하지 않아요.", "error");
      return;
    }

    const filename = mode === "wallpaper" ? "wallpaper.png" : "sentence.png";

    canvas.toBlob((blob) => {
      if (!blob) {
        toast("이미지를 만드는 데 실패했어요.", "error");
        return;
      }

      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        navigator.share({ files: [file] }).catch(() => {});
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      toast(
        mode === "wallpaper"
          ? "배경화면 이미지가 저장되었어요."
          : "이미지가 저장되었어요.",
      );
    }, "image/png");
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-11 items-center rounded-[var(--radius-input)] border border-hairline-strong px-3 py-1.5 text-xs text-stone hover:border-archive hover:text-ink"
      >
        {canShareFiles ? "이미지로 공유" : "이미지로 저장"}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 bottom-full z-20 mb-1 flex min-w-40 flex-col overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-surface shadow-[var(--shadow-card)]">
          <button
            type="button"
            onClick={() => handleGenerate("card")}
            className="flex items-center gap-2 px-4 py-3 text-left text-xs text-ink hover:bg-paper"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-stone">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
            </svg>
            카드 이미지
          </button>
          <button
            type="button"
            onClick={() => handleGenerate("wallpaper")}
            className="flex items-center gap-2 px-4 py-3 text-left text-xs text-ink hover:bg-paper"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-stone">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            배경화면 (9:16)
          </button>
        </div>
      ) : null}
    </div>
  );
}
