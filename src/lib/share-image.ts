export type ShareImageData = {
  body: string;
  source: string | null;
};

export const CANVAS_WIDTH = 1080;
const PADDING_X = 96;
const PADDING_Y = 120;
const BODY_FONT_SIZE = 52;
const BODY_LINE_HEIGHT = 80;
const SOURCE_FONT_SIZE = 28;
const SOURCE_GAP = 40;
const SOURCE_TAG_PADDING_X = 20;
const SOURCE_TAG_PADDING_Y = 14;
const SOURCE_BLOCK_HEIGHT =
  SOURCE_GAP + SOURCE_FONT_SIZE + SOURCE_TAG_PADDING_Y * 2;

// 서명. 밖으로 나간 이미지가 서비스로 돌아올 유일한 단서라 항상 그린다.
const SIGNATURE_GAP = 56;
const SIGNATURE_HEIGHT = 32;
const SIGNATURE_GLYPH_WIDTH = 54; // 글리프 viewBox 1412:1017 비율
const SIGNATURE_TEXT = "글적";
const SIGNATURE_TEXT_GAP = 12;
const SIGNATURE_FONT_SIZE = 26;
const SIGNATURE_BLOCK_HEIGHT = SIGNATURE_GAP + SIGNATURE_HEIGHT;
// 서명 아래는 본문 여백만큼 띄울 필요가 없다. 그대로 두면 카드 하단이 텅 빈다.
const SIGNATURE_BOTTOM_PADDING = 64;

const BODY_FONT = `600 ${BODY_FONT_SIZE}px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`;
const SOURCE_FONT = `${SOURCE_FONT_SIZE}px ui-monospace, "SF Mono", Menlo, "Courier New", monospace`;
const SIGNATURE_FONT = `${SIGNATURE_FONT_SIZE}px ui-monospace, "SF Mono", Menlo, "Courier New", monospace`;

const COLORS = {
  paper: "#faf8f4",
  surface: "#ffffff",
  ink: "#1a1816",
  archive: "#8b6542",
  hairline: "#d8d2c6",
  stoneFaint: "#b5b0a7",
};

function wrapParagraph(
  paragraph: string,
  maxWidth: number,
  measureText: (segment: string) => number,
): string[] {
  if (paragraph.length === 0) return [""];

  const lines: string[] = [];
  let current = "";
  for (const char of paragraph) {
    const candidate = current + char;
    if (current.length > 0 && measureText(candidate) > maxWidth) {
      lines.push(current);
      current = char;
    } else {
      current = candidate;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

export function wrapText(
  text: string,
  maxWidth: number,
  measureText: (segment: string) => number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    lines.push(...wrapParagraph(paragraph, maxWidth, measureText));
  }
  return lines;
}

/** 본문(과 출처)이 끝나는 y좌표. 서명은 이 아래에 놓인다. */
function contentBottom(lineCount: number, hasSource: boolean): number {
  return (
    PADDING_Y +
    lineCount * BODY_LINE_HEIGHT +
    (hasSource ? SOURCE_BLOCK_HEIGHT : 0)
  );
}

export function computeCardHeight(
  lineCount: number,
  hasSource: boolean,
): number {
  return (
    contentBottom(lineCount, hasSource) +
    SIGNATURE_BLOCK_HEIGHT +
    SIGNATURE_BOTTOM_PADDING
  );
}

export type SignatureLayout = {
  top: number;
  height: number;
  right: number;
};

/**
 * 서명 블록의 위치. 카드 우하단에 오른쪽 정렬한다.
 *
 * 가로 구성(글리프 + 워드마크)은 텍스트 실측이 필요해 렌더 시점에 하고,
 * 여기서는 충돌이 날 수 있는 세로 위치와 오른쪽 끝만 정한다.
 */
export function computeSignatureLayout(
  lineCount: number,
  hasSource: boolean,
): SignatureLayout {
  return {
    top: contentBottom(lineCount, hasSource) + SIGNATURE_GAP,
    height: SIGNATURE_HEIGHT,
    right: CANVAS_WIDTH - PADDING_X,
  };
}

export function renderShareCard(
  canvas: HTMLCanvasElement,
  { body, source }: ShareImageData,
  /**
   * 로고 글리프. Canvas는 SVG를 직접 못 그려 호출부가 미리 불러 넘긴다.
   * 없으면 워드마크만 그린다 — 서명이 통째로 빠지는 것보다 낫다.
   */
  glyph?: CanvasImageSource,
): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const maxTextWidth = CANVAS_WIDTH - PADDING_X * 2;
  ctx.font = BODY_FONT;
  const lines = wrapText(body, maxTextWidth, (segment) =>
    ctx.measureText(segment).width,
  );
  const height = computeCardHeight(lines.length, Boolean(source));

  canvas.width = CANVAS_WIDTH;
  canvas.height = height;

  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, CANVAS_WIDTH, height);

  ctx.fillStyle = COLORS.surface;
  ctx.fillRect(24, 24, CANVAS_WIDTH - 48, height - 48);

  ctx.fillStyle = COLORS.ink;
  ctx.font = BODY_FONT;
  ctx.textBaseline = "top";
  lines.forEach((line, index) => {
    ctx.fillText(line, PADDING_X, PADDING_Y + index * BODY_LINE_HEIGHT);
  });

  if (source) {
    const tagY = PADDING_Y + lines.length * BODY_LINE_HEIGHT + SOURCE_GAP;
    ctx.font = SOURCE_FONT;
    const textWidth = ctx.measureText(source).width;
    const tagWidth = textWidth + SOURCE_TAG_PADDING_X * 2;
    const tagHeight = SOURCE_FONT_SIZE + SOURCE_TAG_PADDING_Y * 2;

    ctx.strokeStyle = COLORS.hairline;
    ctx.lineWidth = 2;
    ctx.strokeRect(PADDING_X, tagY, tagWidth, tagHeight);

    ctx.fillStyle = COLORS.archive;
    ctx.fillText(source, PADDING_X + SOURCE_TAG_PADDING_X, tagY + SOURCE_TAG_PADDING_Y);
  }

  const signature = computeSignatureLayout(lines.length, Boolean(source));
  ctx.font = SIGNATURE_FONT;
  const wordmarkWidth = ctx.measureText(SIGNATURE_TEXT).width;
  const glyphWidth = glyph ? SIGNATURE_GLYPH_WIDTH + SIGNATURE_TEXT_GAP : 0;
  const signatureLeft = signature.right - glyphWidth - wordmarkWidth;

  if (glyph) {
    const glyphHeight = (SIGNATURE_GLYPH_WIDTH * 1017) / 1412;
    // 글리프는 검정으로 들어온다. 서명이 본문보다 세게 보이면 안 되므로 눌러 그린다.
    ctx.globalAlpha = 0.62;
    ctx.drawImage(
      glyph,
      signatureLeft,
      signature.top + (signature.height - glyphHeight) / 2,
      SIGNATURE_GLYPH_WIDTH,
      glyphHeight,
    );
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = COLORS.stoneFaint;
  ctx.fillText(
    SIGNATURE_TEXT,
    signatureLeft + glyphWidth,
    signature.top + (signature.height - SIGNATURE_FONT_SIZE) / 2,
  );

  return true;
}

/* ── 배경화면 모드 ── */

const WALLPAPER_WIDTH = 1080;
const WALLPAPER_HEIGHT = 1920;
const WP_PADDING_X = 100;
const WP_SOURCE_FONT_SIZE = 28;
const WP_SOURCE_GAP = 48;

// 글자 수에 따라 폰트 크기를 동적으로 결정한다.
// 짧은 문장은 크게, 긴 문장은 읽히는 선에서 줄인다.
type WpFontTier = { maxChars: number; fontSize: number; lineHeight: number };
const WP_FONT_TIERS: WpFontTier[] = [
  { maxChars: 20, fontSize: 80, lineHeight: 120 },
  { maxChars: 40, fontSize: 68, lineHeight: 104 },
  { maxChars: 80, fontSize: 58, lineHeight: 90 },
  { maxChars: Infinity, fontSize: 48, lineHeight: 76 },
];

function pickWpFontTier(charCount: number): WpFontTier {
  return WP_FONT_TIERS.find((t) => charCount <= t.maxChars) ?? WP_FONT_TIERS[WP_FONT_TIERS.length - 1];
}

function makeWpBodyFont(fontSize: number): string {
  return `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`;
}

const WP_COLORS = {
  bg: "#faf8f4",
  ink: "#1a1816",
  archive: "#8b6542",
  stoneFaint: "#b5b0a7",
};

/**
 * 한국어 배경화면용 줄바꿈 — 균등 분배.
 *
 * 1. 원본 줄바꿈(\n)을 최우선으로 유지한다.
 * 2. 한 줄이 maxWidth를 넘으면:
 *    a) 필요한 최소 줄 수를 구한다.
 *    b) 줄 수를 고정하고, 각 줄 길이가 최대한 균등해지는 끊김점을 찾는다.
 *       → "인생은 짧다. 그러니 화낼시간도 없다" 같은 문장이
 *         "인생은 짧다." / "그러니 화낼시간도 없다" 로 고르게 나뉜다.
 *    c) 끊김점: 구두점 뒤, 공백 뒤, 없으면 글자 단위 폴백.
 */
function wrapWallpaperText(
  text: string,
  maxWidth: number,
  measureText: (s: string) => number,
): string[] {
  const result: string[] = [];

  for (const paragraph of text.split("\n")) {
    if (paragraph.length === 0) {
      result.push("");
      continue;
    }
    if (measureText(paragraph) <= maxWidth) {
      result.push(paragraph);
      continue;
    }
    result.push(...balancedWrap(paragraph, maxWidth, measureText));
  }

  return result;
}

/**
 * 균등 줄바꿈 — 줄 간 너비 차이를 최소화한다.
 */
function balancedWrap(
  text: string,
  maxWidth: number,
  measureText: (s: string) => number,
): string[] {
  const breaks = findBreakPoints(text);
  if (breaks.length === 0) {
    return wrapParagraph(text, maxWidth, measureText);
  }

  // 필요한 최소 줄 수
  const totalWidth = measureText(text);
  const minLines = Math.ceil(totalWidth / maxWidth);
  const targetWidth = totalWidth / minLines;

  const lines: string[] = [];
  let lineStart = 0;

  for (let lineIdx = 0; lineIdx < minLines - 1; lineIdx++) {
    let bestBreak = -1;
    let bestDiff = Infinity;

    for (const bp of breaks) {
      if (bp <= lineStart) continue;
      const candidate = text.slice(lineStart, bp).trimEnd();
      const w = measureText(candidate);
      if (w > maxWidth) break; // 넘으면 더 볼 필요 없음
      const diff = Math.abs(w - targetWidth);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestBreak = bp;
      }
    }

    if (bestBreak <= lineStart) {
      // 끊김점으로 안 되면 글자 단위 폴백
      lines.push(...wrapParagraph(text.slice(lineStart), maxWidth, measureText));
      return lines;
    }

    lines.push(text.slice(lineStart, bestBreak).trimEnd());
    lineStart = bestBreak;
    while (lineStart < text.length && text[lineStart] === " ") lineStart++;
  }

  // 마지막 줄
  const remaining = text.slice(lineStart).trimEnd();
  if (remaining.length > 0) {
    if (measureText(remaining) <= maxWidth) {
      lines.push(remaining);
    } else {
      lines.push(...wrapParagraph(remaining, maxWidth, measureText));
    }
  }

  return lines;
}

/**
 * 자연스러운 끊김 위치(인덱스)를 반환한다.
 * 반환값은 "이 위치부터 다음 줄" 이라는 뜻이다.
 */
function findBreakPoints(text: string): number[] {
  const points = new Set<number>();
  // 구두점 뒤 (우선순위 높음)
  const punctuation = /[.!?…,，。]\s*/g;
  let m;
  while ((m = punctuation.exec(text)) !== null) {
    const after = m.index + m[0].length;
    if (after < text.length) points.add(after);
  }
  // 공백 뒤
  for (let i = 0; i < text.length; i++) {
    if (text[i] === " " && i + 1 < text.length) {
      points.add(i + 1);
    }
  }
  return [...points].sort((a, b) => a - b);
}

export function renderWallpaper(
  canvas: HTMLCanvasElement,
  { body, source }: ShareImageData,
  glyph?: CanvasImageSource,
): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  canvas.width = WALLPAPER_WIDTH;
  canvas.height = WALLPAPER_HEIGHT;

  // 배경
  ctx.fillStyle = WP_COLORS.bg;
  ctx.fillRect(0, 0, WALLPAPER_WIDTH, WALLPAPER_HEIGHT);

  // 글자 수에 따른 폰트 크기 결정
  const plainText = body.replace(/\n/g, "");
  const tier = pickWpFontTier(plainText.length);
  const bodyFont = makeWpBodyFont(tier.fontSize);

  // 본문 줄바꿈
  const maxTextWidth = WALLPAPER_WIDTH - WP_PADDING_X * 2;
  ctx.font = bodyFont;
  const lines = wrapWallpaperText(body, maxTextWidth, (s) => ctx.measureText(s).width);

  // 콘텐츠 높이 계산 → 세로 중앙 배치
  const bodyHeight = lines.length * tier.lineHeight;
  const sourceHeight = source ? WP_SOURCE_GAP + WP_SOURCE_FONT_SIZE + 28 : 0;
  const sigHeight = 56 + SIGNATURE_HEIGHT;
  const totalContentHeight = bodyHeight + sourceHeight + sigHeight;
  const startY = Math.max(200, (WALLPAPER_HEIGHT - totalContentHeight) / 2);

  // 본문 — 가운데 정렬
  ctx.fillStyle = WP_COLORS.ink;
  ctx.font = bodyFont;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  const centerX = WALLPAPER_WIDTH / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * tier.lineHeight);
  });

  // 출처 — 가운데 정렬
  if (source) {
    const sourceY = startY + bodyHeight + WP_SOURCE_GAP;
    ctx.font = `${WP_SOURCE_FONT_SIZE}px ui-monospace, "SF Mono", Menlo, "Courier New", monospace`;
    ctx.fillStyle = WP_COLORS.archive;
    ctx.fillText(`— ${source}`, centerX, sourceY);
  }
  ctx.textAlign = "start";

  // 서명 (하단 중앙)
  const sigY = WALLPAPER_HEIGHT - 120;
  ctx.font = SIGNATURE_FONT;
  const wordmarkW = ctx.measureText(SIGNATURE_TEXT).width;
  const glyphW = glyph ? SIGNATURE_GLYPH_WIDTH + SIGNATURE_TEXT_GAP : 0;
  const sigTotalW = glyphW + wordmarkW;
  const sigLeft = (WALLPAPER_WIDTH - sigTotalW) / 2;

  if (glyph) {
    const glyphH = (SIGNATURE_GLYPH_WIDTH * 1017) / 1412;
    ctx.globalAlpha = 0.5;
    ctx.drawImage(
      glyph,
      sigLeft,
      sigY + (SIGNATURE_HEIGHT - glyphH) / 2,
      SIGNATURE_GLYPH_WIDTH,
      glyphH,
    );
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = WP_COLORS.stoneFaint;
  ctx.fillText(
    SIGNATURE_TEXT,
    sigLeft + glyphW,
    sigY + (SIGNATURE_HEIGHT - SIGNATURE_FONT_SIZE) / 2,
  );

  return true;
}
