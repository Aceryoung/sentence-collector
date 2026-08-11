"use client";

import { markAllRead } from "./actions";

export function MarkAllReadButton() {
  return (
    <form action={markAllRead}>
      <button
        type="submit"
        className="text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        모두 읽음
      </button>
    </form>
  );
}
