import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * 홈 화면 아이콘. 투명 배경이면 iOS가 검정으로 채워 마크가 사라지므로
 * 종이색을 깔고 잉크색 글리프를 얹는다.
 *
 * 글리프 폭은 180px의 69%로 잡는다. iOS가 모서리를 둥글게 깎기 때문에
 * 가장자리까지 채우면 펜촉 끝이 잘린다.
 */
export default function AppleIcon() {
  const glyph = readFileSync(
    join(process.cwd(), "public/brand/geuljeok-glyph.svg"),
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
          width={124}
          height={89}
          src={`data:image/svg+xml;base64,${Buffer.from(glyph).toString("base64")}`}
          alt=""
        />
      </div>
    ),
    size,
  );
}
