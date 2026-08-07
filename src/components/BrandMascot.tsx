/**
 * 글적 마스코트.
 *
 * SVG를 인라인하지 않고 mask-image 로 얹는다. 인라인하면 16KB가 JS 번들에
 * 들어가고, <img>로 넣으면 SVG의 currentColor 가 죽어 다크 모드에서 사라진다.
 * 마스크로 쓰면 파일은 브라우저 캐시에 남고 색은 currentColor 를 따른다.
 *
 * 최소 사용 크기 32px — 그 아래에서는 눈이 뭉쳐 얼룩으로 보인다(브라우저 실측).
 */
const MASK: React.CSSProperties = {
  WebkitMaskImage: "url(/brand/geuljeok-mascot.svg)",
  maskImage: "url(/brand/geuljeok-mascot.svg)",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  backgroundColor: "currentColor",
};

export function BrandMascot({ className }: { className?: string }) {
  // 장식이다. 빈 상태의 뜻은 옆 문구가 전한다 — 읽어주면 중복이라 숨긴다.
  return <span aria-hidden="true" className={className} style={MASK} />;
}
