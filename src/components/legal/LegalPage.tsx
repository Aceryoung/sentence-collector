import Link from "next/link";
import type { ReactNode } from "react";

/**
 * 처리방침·이용약관 공통 레이아웃. 법률 문서는 본문이 길어 읽기 폭과
 * 줄간격이 피드 화면과 달라야 한다.
 */
export function LegalPage({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-bold text-ink">{title}</h1>
        <p className="text-xs text-stone-faint">
          시행일 {effectiveDate}
        </p>
      </div>

      <div className="flex flex-col gap-6 leading-relaxed break-words text-ink">
        {children}
      </div>

      <Link
        href="/"
        className="mt-4 self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 글적으로 돌아가기
      </Link>
    </main>
  );
}

export function Article({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-serif text-lg font-bold text-ink">{heading}</h2>
      {children}
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-stone">{children}</p>;
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-stone">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

/** 좁은 화면에서 표가 화면을 밀어내지 않도록 가로 스크롤을 표 안에 가둔다. */
export function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-lg border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-hairline-strong">
            {headers.map((header) => (
              <th key={header} className="py-2 pr-4 font-normal text-ink">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-hairline">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-2 pr-4 align-top text-stone">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
