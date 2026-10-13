"use client";

import { useState, useRef } from "react";
import { renderShareCard, renderWallpaper } from "@/lib/share-image";
import { useToast } from "@/components/Toast";

type FeaturedSentence = {
  id: string;
  body: string;
  source: string | null;
  likeCount: number;
  createdAt: string;
};

type DailyWordData = {
  id: string;
  word: string;
  description: string | null;
  scheduled_date: string;
};

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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function PreviewCard({ sentence }: { sentence: FeaturedSentence }) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleDownload(mode: "card" | "wallpaper") {
    const canvas = document.createElement("canvas");
    const glyph = await loadGlyph();
    const data = { body: sentence.body, source: sentence.source };
    const rendered =
      mode === "wallpaper"
        ? renderWallpaper(canvas, data, glyph)
        : renderShareCard(canvas, data, glyph);

    if (!rendered) {
      toast("이미지 생성에 실패했어요.", "error");
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        toast("이미지 생성에 실패했어요.", "error");
        return;
      }
      const filename =
        mode === "wallpaper"
          ? `sns-wallpaper-${sentence.id.slice(0, 8)}.png`
          : `sns-card-${sentence.id.slice(0, 8)}.png`;
      downloadBlob(blob, filename);
      toast(
        mode === "wallpaper"
          ? "배경화면 이미지가 저장되었어요."
          : "카드 이미지가 저장되었어요.",
      );
    }, "image/png");
  }

  async function handlePreview() {
    if (previewUrl) {
      setPreviewUrl(null);
      return;
    }
    const canvas = document.createElement("canvas");
    const glyph = await loadGlyph();
    const rendered = renderShareCard(
      canvas,
      { body: sentence.body, source: sentence.source },
      glyph,
    );
    if (rendered) {
      setPreviewUrl(canvas.toDataURL("image/png"));
    }
  }

  function handleCopyCaption() {
    const caption = [
      sentence.body,
      "",
      sentence.source ? `— ${sentence.source}` : "",
      "",
      "#글적 #문장수집 #명문장 #필사 #책스타그램 #독서기록",
      "",
      "@geuljeok_official",
      "글적에서 더 보기 → geuljeok.vercel.app",
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(caption).then(() => {
      toast("캡션이 복사되었어요.");
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-ink" style={{ wordBreak: "keep-all" }}>
            {sentence.body}
          </p>
          {sentence.source ? (
            <p className="mt-1 text-xs text-stone">— {sentence.source}</p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-[var(--radius-pill)] bg-paper px-2 py-1 text-xs tabular-nums text-archive">
          {sentence.likeCount}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleDownload("card")}
          className="rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1.5 text-xs text-stone hover:text-ink"
        >
          카드 저장
        </button>
        <button
          type="button"
          onClick={() => handleDownload("wallpaper")}
          className="rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1.5 text-xs text-stone hover:text-ink"
        >
          배경화면 저장
        </button>
        <button
          type="button"
          onClick={handlePreview}
          className="rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1.5 text-xs text-stone hover:text-ink"
        >
          {previewUrl ? "미리보기 닫기" : "미리보기"}
        </button>
        <button
          type="button"
          onClick={handleCopyCaption}
          className="rounded-[var(--radius-pill)] border border-archive bg-archive/10 px-3 py-1.5 text-xs text-archive hover:bg-archive/20"
        >
          캡션 복사
        </button>
      </div>

      {previewUrl ? (
        <div className="mt-2 overflow-hidden rounded-[var(--radius-card)] border border-hairline">
          <img
            src={previewUrl}
            alt="미리보기"
            className="w-full"
          />
        </div>
      ) : null}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function DailyWordCard({ dailyWord }: { dailyWord: DailyWordData }) {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleDownload() {
    const canvas = document.createElement("canvas");
    const glyph = await loadGlyph();
    const data = {
      body: dailyWord.word,
      source: dailyWord.description,
    };
    const rendered = renderShareCard(canvas, data, glyph);
    if (!rendered) {
      toast("이미지 생성에 실패했어요.", "error");
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        toast("이미지 생성에 실패했어요.", "error");
        return;
      }
      downloadBlob(blob, `daily-word-${dailyWord.scheduled_date}.png`);
      toast("오늘의 단어 이미지가 저장되었어요.");
    }, "image/png");
  }

  async function handlePreview() {
    if (previewUrl) {
      setPreviewUrl(null);
      return;
    }
    const canvas = document.createElement("canvas");
    const glyph = await loadGlyph();
    const rendered = renderShareCard(canvas, {
      body: dailyWord.word,
      source: dailyWord.description,
    }, glyph);
    if (rendered) {
      setPreviewUrl(canvas.toDataURL("image/png"));
    }
  }

  function handleCopyCaption() {
    const dateStr = new Date(dailyWord.scheduled_date).toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
    const caption = [
      `오늘의 단어: ${dailyWord.word}`,
      "",
      dailyWord.description ?? "",
      "",
      `${dateStr}, 이 단어에서 떠오르는 생각을 적어보세요.`,
      "",
      "#글적 #오늘의단어 #문장수집 #필사 #책스타그램 #독서기록",
      "",
      "@geuljeok_official",
      "글적에서 더 보기 → geuljeok.vercel.app/daily-word",
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(caption).then(() => {
      toast("캡션이 복사되었어요.");
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-archive/30 bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest text-coral">오늘의 단어</span>
          <time className="text-xs text-stone-faint">
            {new Date(dailyWord.scheduled_date).toLocaleDateString("ko-KR")}
          </time>
        </div>
      </div>
      <p className="font-serif text-2xl font-bold text-ink">{dailyWord.word}</p>
      {dailyWord.description ? (
        <p className="text-sm italic text-stone">{dailyWord.description}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-[var(--radius-pill)] bg-archive px-3 py-1.5 text-xs text-archive-contrast hover:opacity-90"
        >
          카드 이미지 저장
        </button>
        <button
          type="button"
          onClick={handlePreview}
          className="rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1.5 text-xs text-stone hover:text-ink"
        >
          {previewUrl ? "미리보기 닫기" : "미리보기"}
        </button>
        <button
          type="button"
          onClick={handleCopyCaption}
          className="rounded-[var(--radius-pill)] border border-archive bg-archive/10 px-3 py-1.5 text-xs text-archive hover:bg-archive/20"
        >
          캡션 복사
        </button>
      </div>

      {previewUrl ? (
        <div className="mt-2 overflow-hidden rounded-[var(--radius-card)] border border-hairline">
          <img src={previewUrl} alt="미리보기" className="w-full" />
        </div>
      ) : null}
    </div>
  );
}

export function AdminSns({
  sentences,
  dailyWord,
}: {
  sentences: FeaturedSentence[];
  dailyWord: DailyWordData | null;
}) {
  return (
    <section className="flex flex-col gap-6">
      {/* 오늘의 단어 카드 */}
      {dailyWord ? (
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-medium text-ink">오늘의 단어 카드</h2>
            <p className="mt-1 text-xs text-stone">
              이미지를 저장하고 캡션을 복사해 인스타그램에 올리세요.
            </p>
          </div>
          <DailyWordCard dailyWord={dailyWord} />
        </div>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-8 text-center">
          <p className="text-sm text-stone">오늘의 단어가 아직 등록되지 않았어요.</p>
        </div>
      )}

      {/* 인기 문장 카드 */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-medium text-ink">인기 문장 카드</h2>
          <p className="mt-1 text-xs text-stone">
            최근 7일간 좋아요가 많은 문장입니다. 이미지를 저장하고 SNS에 업로드하세요.
          </p>
        </div>

        {sentences.length === 0 ? (
          <p className="py-12 text-center text-sm text-stone">
            최근 7일간 좋아요를 받은 문장이 없어요.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sentences.map((s, i) => (
              <div key={s.id} className="flex gap-3">
                <span className="mt-4 shrink-0 text-xs tabular-nums text-stone">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <PreviewCard sentence={s} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
