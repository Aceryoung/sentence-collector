import Anthropic from "@anthropic-ai/sdk";
import { EMOTION_TAGS } from "@/lib/validation";

const client = new Anthropic();

export async function suggestTags(
  body: string,
  source: string | null,
  commentary: string | null,
): Promise<string[]> {
  const tagList = EMOTION_TAGS.join(", ");

  const prompt = `아래 문장을 읽고, 이 문장에 어울리는 감정 태그를 2~3개 추천해줘.

반드시 아래 목록에서만 골라:
${tagList}

문장: "${body}"
${source ? `출처: ${source}` : ""}
${commentary ? `감상: ${commentary}` : ""}

JSON 배열로만 답해. 예: ["위로", "온기"]`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];

    const tags: unknown = JSON.parse(match[0]);
    if (!Array.isArray(tags)) return [];

    return tags
      .filter(
        (t): t is string =>
          typeof t === "string" &&
          (EMOTION_TAGS as readonly string[]).includes(t),
      )
      .slice(0, 3);
  } catch {
    return [];
  }
}
