"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-sm text-stone">
        문장을 불러오지 못했어요.
      </p>
      <button
        onClick={reset}
        className="border border-hairline-strong bg-surface px-4 py-2 font-mono text-sm text-ink"
      >
        다시 시도
      </button>
    </main>
  );
}
