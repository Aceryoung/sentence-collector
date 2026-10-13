"use client";

type KpiItem = {
  label: string;
  value: number | string;
  change?: number | null;
  target?: number | null;
  note?: string;
};

export function AdminKpi({ items }: { items: KpiItem[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-bold tracking-widest text-archive">
        핵심 KPI
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-archive/20 bg-surface px-4 py-4 shadow-[var(--shadow-card)]"
          >
            <span className="text-[10px] font-semibold tracking-wide text-stone">
              {item.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold tabular-nums text-ink">
                {typeof item.value === "number"
                  ? item.value.toLocaleString("ko-KR")
                  : item.value}
              </span>
              {item.change != null ? (
                <span
                  className={`text-xs font-medium tabular-nums ${
                    item.change > 0
                      ? "text-green-600"
                      : item.change < 0
                        ? "text-coral"
                        : "text-stone"
                  }`}
                >
                  {item.change > 0 ? "+" : ""}
                  {item.change}%
                </span>
              ) : null}
            </div>
            {item.target != null ? (
              <div className="flex flex-col gap-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-hairline">
                  <div
                    className="h-full rounded-full bg-archive transition-all"
                    style={{
                      width: `${Math.min(
                        ((typeof item.value === "number" ? item.value : 0) /
                          item.target) *
                          100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] tabular-nums text-stone-faint">
                  목표 {item.target.toLocaleString("ko-KR")}
                </span>
              </div>
            ) : null}
            {item.note ? (
              <span className="text-[10px] text-stone-faint">{item.note}</span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
