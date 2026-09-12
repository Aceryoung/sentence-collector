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
type ImageAction = "share" | "download";

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

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleGenerate(mode: ImageMode, action: ImageAction) {
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

      if (action === "share") {
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          navigator.share({ files: [file] }).catch(() => {});
          return;
        }
      }

      // 다운로드 (action === "download" 또는 share 불가 시 폴백)
      downloadBlob(blob, filename);
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
        이미지로 저장
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
        <div className="absolute right-0 bottom-full z-20 mb-1 flex min-w-44 flex-col overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-surface shadow-[var(--shadow-card)]">
          {/* 카드 이미지 */}
          <button
            type="button"
            onClick={() => handleGenerate("card", "download")}
            className="flex items-center gap-2 px-4 py-3 text-left text-xs text-ink hover:bg-paper"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-stone">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
            </svg>
            카드 이미지 저장
          </button>
          {/* 배경화면 */}
          <button
            type="button"
            onClick={() => handleGenerate("wallpaper", "download")}
            className="flex items-center gap-2 px-4 py-3 text-left text-xs text-ink hover:bg-paper"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-stone">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            배경화면 저장 (9:16)
          </button>
          {/* 공유 — navigator.share 지원 시만 표시 */}
          {canShareFiles ? (
            <>
              <hr className="border-hairline" />
              <button
                type="button"
                onClick={() => handleGenerate("card", "share")}
                className="flex items-center gap-2 px-4 py-3 text-left text-xs text-ink hover:bg-paper"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-stone">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                카드 이미지 공유
              </button>
              <button
                type="button"
                onClick={() => handleGenerate("wallpaper", "share")}
                className="flex items-center gap-2 px-4 py-3 text-left text-xs text-ink hover:bg-paper"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-stone">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                배경화면 공유 (9:16)
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
