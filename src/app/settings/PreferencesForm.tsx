"use client";

import { useActionState } from "react";
import { updatePreferences, type PreferencesState } from "./actions";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function PreferencesForm({
  initialReminder,
  initialHour,
  initialWeeklyReport,
}: {
  initialReminder: boolean;
  initialHour: number;
  initialWeeklyReport: boolean;
}) {
  const [state, action, isPending] = useActionState<PreferencesState, FormData>(
    updatePreferences,
    { error: null, success: false },
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <h2 className="font-serif text-base font-bold text-ink">알림 설정</h2>

      {/* 필사 리마인더 */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="reminder_enabled"
          defaultChecked={initialReminder}
          className="h-4 w-4 rounded border-hairline-strong accent-archive"
        />
        <span className="text-sm text-ink">매일 필사 리마인더 받기</span>
      </label>

      <div className="flex items-center gap-2">
        <span className="text-xs text-stone">알림 시간</span>
        <select
          name="reminder_hour"
          defaultValue={initialHour}
          className="rounded border border-hairline-strong bg-surface px-2 py-1.5 text-sm text-ink"
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h.toString().padStart(2, "0")}:00
            </option>
          ))}
        </select>
      </div>

      <div className="h-px bg-hairline" />

      {/* 주간 리포트 */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="weekly_report_enabled"
          defaultChecked={initialWeeklyReport}
          className="h-4 w-4 rounded border-hairline-strong accent-archive"
        />
        <span className="text-sm text-ink">주간 활동 리포트 받기</span>
      </label>

      {state.error ? (
        <p className="text-xs text-coral">{state.error}</p>
      ) : null}

      {state.success ? (
        <p className="text-xs text-archive">저장되었어요.</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="btn-press self-start rounded-[var(--radius-pill)] bg-cta px-4 py-2 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover disabled:opacity-60"
      >
        {isPending ? "저장 중…" : "저장"}
      </button>
    </form>
  );
}
