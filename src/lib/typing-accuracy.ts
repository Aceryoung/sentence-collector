/**
 * 타이핑 필사 정확도 계산.
 *
 * 글자 단위 1:1 비교 — 원문과 입력 텍스트를 공백 정규화한 뒤
 * 같은 위치의 글자가 일치하면 맞는 것으로 센다.
 * 길이 차이도 오류로 반영한다.
 */
export function calculateAccuracy(original: string, typed: string): number {
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  const o = norm(original);
  const t = norm(typed);
  const maxLen = Math.max(o.length, t.length);
  if (maxLen === 0) return 1;

  let matches = 0;
  const minLen = Math.min(o.length, t.length);
  for (let i = 0; i < minLen; i++) {
    if (o[i] === t[i]) matches++;
  }
  return matches / maxLen;
}
