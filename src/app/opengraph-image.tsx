import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "글적 — 문장을 모으고, 다시 꺼내보고, 나누는 곳";

/**
 * 링크 미리보기 이미지.
 *
 * 텍스트를 그리지 않고 락업 SVG만 쓴다. ImageResponse(Satori)는 한글을 그리려면
 * 한글 폰트 파일을 따로 실어야 하는데, 락업에 손글씨 "글적"이 이미 들어 있어
 * 폰트 없이도 브랜드가 전달된다.
 */
export default function OpengraphImage() {
  const lockup = readFileSync(
    join(process.cwd(), "public/brand/geuljeok-lockup.svg"),
    "utf8",
  ).replace(/currentColor/g, "#0a0a09");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf9f6",
        }}
      >
        <img
          width={252}
          height={509}
          src={`data:image/svg+xml;base64,${Buffer.from(lockup).toString("base64")}`}
          alt=""
        />
      </div>
    ),
    size,
  );
}
