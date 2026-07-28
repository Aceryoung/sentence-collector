export type ShareImageData = {
  body: string;
  source: string | null;
};

const CANVAS_WIDTH = 1080;
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

const BODY_FONT = `600 ${BODY_FONT_SIZE}px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`;
const SOURCE_FONT = `${SOURCE_FONT_SIZE}px ui-monospace, "SF Mono", Menlo, "Courier New", monospace`;

const COLORS = {
  paper: "#faf9f6",
  surface: "#ffffff",
  ink: "#0a0a09",
  archive: "#6b4a2f",
  hairline: "#d8d5cc",
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

export function computeCardHeight(
  lineCount: number,
  hasSource: boolean,
): number {
  const textHeight = lineCount * BODY_LINE_HEIGHT;
  return PADDING_Y * 2 + textHeight + (hasSource ? SOURCE_BLOCK_HEIGHT : 0);
}

export function renderShareCard(
  canvas: HTMLCanvasElement,
  { body, source }: ShareImageData,
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

  return true;
}
