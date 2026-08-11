"use client";

import { joinChallenge } from "./actions";

export function JoinButton({ challengeId }: { challengeId: string }) {
  return (
    <form action={joinChallenge} className="flex justify-center">
      <input type="hidden" name="challengeId" value={challengeId} />
      <button
        type="submit"
        className="rounded-[var(--radius-pill)] border-none bg-archive px-6 py-2.5 text-sm text-archive-contrast"
      >
        챌린지 참여하기
      </button>
    </form>
  );
}
