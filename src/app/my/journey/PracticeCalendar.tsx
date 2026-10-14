"use client";

import { useState } from "react";

type Props = {
  activityMap: Record<string, number>;
  streak: number;
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDow(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatMonth(year: number, month: number): string {
  return `${year}년 ${month + 1}월`;
}

export function PracticeCalendar({ activityMap, streak }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDow(year, month);
  const todayStr = today.toISOString().slice(0, 10);

  const monthDates: (string | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }),
  ];

  const monthTotal = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return activityMap[key] ?? 0;
  }).reduce((a, b) => a + b, 0);

  const activeDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return (activityMap[key] ?? 0) > 0 ? 1 : 0;
  }).reduce<number>((a, b) => a + b, 0);

  function goPrev() {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  }

  function goNext() {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    if (new Date(nextYear, nextMonth, 1) > today) return;
    setYear(nextYear);
    setMonth(nextMonth);
  }

  const canGoNext = (() => {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    return new Date(nextYear, nextMonth, 1) <= today;
  })();

  return (
    <section className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
      {/* 헤더: 월 네비게이션 + 스트릭 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
            aria-label="이전 달"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h2 className="font-serif text-sm font-bold text-ink">
            {formatMonth(year, month)}
          </h2>
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className="flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink disabled:opacity-30"
            aria-label="다음 달"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
        {streak > 0 ? (
          <div className="flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-coral-soft px-2.5 py-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
            <span className="text-xs font-bold tabular-nums text-coral">{streak}일 연속</span>
          </div>
        ) : null}
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-center text-[10px] font-semibold text-stone">
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 격자 */}
      <div className="grid grid-cols-7 gap-1">
        {monthDates.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} />;
          const count = activityMap[dateStr] ?? 0;
          const isToday = dateStr === todayStr;
          const day = parseInt(dateStr.split("-")[2], 10);

          return (
            <div
              key={dateStr}
              title={count > 0 ? `${dateStr}: ${count}건 활동` : dateStr}
              className={`relative flex h-9 items-center justify-center rounded-lg text-xs tabular-nums transition-colors ${
                isToday
                  ? "ring-1 ring-archive"
                  : ""
              } ${
                count > 0
                  ? "bg-archive/15 font-bold text-archive"
                  : "text-stone"
              }`}
            >
              {day}
              {count > 0 ? (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-archive" />
              ) : null}
            </div>
          );
        })}
      </div>

      {/* 월간 요약 */}
      <div className="flex gap-4 border-t border-hairline pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-stone">활동 일수</span>
          <span className="font-serif text-lg font-bold text-ink">{activeDays}일</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-stone">총 활동</span>
          <span className="font-serif text-lg font-bold text-ink">{monthTotal}건</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-stone">달성률</span>
          <span className="font-serif text-lg font-bold text-ink">
            {daysInMonth > 0 ? Math.round((activeDays / daysInMonth) * 100) : 0}%
          </span>
        </div>
      </div>
    </section>
  );
}
