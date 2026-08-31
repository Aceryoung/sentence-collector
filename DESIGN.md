# 글적(GEULJEOK) 디자인 시스템

> Ink Note Narrative — 종이와 잉크의 아날로그 질감을 디지털로 옮긴 디자인 시스템

## 디자인 원칙

1. **종이 위의 잉크** — 크림색 종이 위에 진한 잉크로 쓴 느낌. 과도한 장식 없이 텍스트 자체가 주인공.
2. **고요한 인터랙션** — 급격한 전환 대신 부드러운 fade-up, 미세한 리프트 효과.
3. **시각적 위계** — 세리프(본문) · 산세리프(UI) · 모노스페이스(라벨) 세 축으로 정보 계층 구분.
4. **듀얼 테마** — 라이트(Ink Note Narrative) / 다크(Nocturnal Inkwell) 동일 토큰으로 운영.

## 컬러 토큰

### 배경(Backgrounds)

| 토큰 | 라이트 | 다크 | 용도 |
|------|--------|------|------|
| `--paper` | `#fbf9f5` | `#141313` | 페이지 배경. 미세한 grain 노이즈 오버레이 적용. |
| `--surface` | `#f5f3ef` | `#1c1b1c` | 카드, 입력 필드, 올린 표면. |

### 텍스트(Text)

| 토큰 | 라이트 | 다크 | 용도 |
|------|--------|------|------|
| `--ink-black` | `#1a2a3a` | `#e3e2de` | 본문 텍스트. Deep Navy에 가까운 잉크색. |
| `--stone` | `#6b7a8a` | `#8a8b89` | 보조 텍스트, 라벨. |
| `--stone-faint` | `#9ba5b0` | `#5a5a59` | 비활성 텍스트, 플레이스홀더. |

### 강조(Accents)

| 토큰 | 라이트 | 다크 | 용도 |
|------|--------|------|------|
| `--archive` | `#4a6580` | `#7a9ab5` | 링크, 브랜드 컬러, 아이콘. |
| `--archive-contrast` | `#fbf9f5` | `#141313` | archive 배경 위 텍스트. |
| `--cta` | `#1e3a5f` | `#7ab0d9` | CTA 버튼 배경. Deep Ink Blue. |
| `--cta-hover` | `#15304f` | `#8fc0e5` | CTA 호버 상태. |
| `--cta-contrast` | `#f5f3ef` | `#141313` | CTA 위 텍스트. |
| `--coral` | `#c4654a` | `#e8836a` | 포인트 강조, 알림, 성취 뱃지. |
| `--coral-soft` | `rgba(196,101,74,0.12)` | `rgba(232,131,106,0.15)` | 코랄 배경 하이라이트. |

### 보더 & 그림자(Borders & Shadows)

| 토큰 | 라이트 | 다크 | 용도 |
|------|--------|------|------|
| `--hairline` | `#dbdad6` | `#3a3939` | 기본 보더, 구분선. |
| `--hairline-strong` | `#c8c7c3` | `#4a4949` | 강조 보더, 인터랙티브 요소 보더. |
| `--shadow-card` | `0 1px 3px …` | `0 1px 3px …` | 카드 기본 그림자. |
| `--shadow-card-hover` | `0 2px 6px …` | `0 2px 6px …` | 카드 호버 그림자. |

## 라디우스(Radius)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--radius-card` | `8px` | 카드, 섹션 컨테이너. |
| `--radius-input` | `8px` | 입력 필드, 드롭다운. |
| `--radius-pill` | `9999px` | 태그, 뱃지, 환약형 버튼. |

## 타이포그래피(Typography)

### 폰트 스택

| 역할 | CSS 변수 | 스택 |
|------|----------|------|
| 세리프 (본문) | `--font-serif` | Literata, Noto Serif KR, Batang, serif |
| 산세리프 (UI) | `--font-sans` | system-ui (-apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic), sans-serif |
| 모노스페이스 (라벨) | `--font-mono` | ui-monospace, SF Mono, Menlo, Courier New, monospace |

### 사용 규칙

- **제목(h1~h3)**: `font-serif`, `letter-spacing: -0.02em`, `line-height: 1.35`, `text-wrap: balance`
- **본문**: `font-serif`, `letter-spacing: -0.01em`, `line-height: 1.7`
- **출처/태그**: `font-mono`, 기본 크기보다 작게
- **UI 라벨**: `font-sans`, `text-xs`, 대문자 시 `tracking-widest`

### 문장 텍스트 (`.user-text`)

사용자가 입력한 문장에는 항상 `.user-text` 클래스를 적용한다:
```css
.user-text {
  word-break: keep-all;     /* 한국어 단어 단위 줄바꿈 */
  white-space: pre-wrap;    /* 줄바꿈 보존 */
  overflow-wrap: break-word; /* 긴 URL 방어 */
}
```

## 컴포넌트 패턴

### 카드 (Card)

```html
<div class="rounded-[var(--radius-card)] border border-hairline bg-surface
            px-5 py-4 shadow-[var(--shadow-card)]">
  <!-- 콘텐츠 -->
</div>
```

인터랙티브 카드에는 `card-lift` 클래스 추가:
```
hover:border-archive/40 hover:shadow-[var(--shadow-card-hover)]
```

### CTA 버튼

```html
<button class="rounded-[var(--radius-pill)] border-none bg-cta
               px-5 py-2.5 text-sm font-bold text-cta-contrast
               hover:bg-cta-hover">
  라벨
</button>
```

### 보조 버튼 (Secondary)

```html
<button class="rounded-[var(--radius-pill)] border border-hairline-strong
               px-3 py-1.5 text-xs text-stone
               hover:border-archive hover:text-ink">
  라벨
</button>
```

### 태그 / 필

```html
<span class="rounded-[var(--radius-pill)] border border-hairline-strong
             px-2.5 py-0.5 text-xs text-stone">
  태그명
</span>
```

### 섹션 라벨

```html
<span class="text-xs font-bold tracking-widest text-coral">
  라벨 텍스트
</span>
```

## 애니메이션

### fade-up 진입 애니메이션

```html
<div class="animate-fade-up" style="animation-delay: 50ms">
  <!-- 순차 등장 콘텐츠 -->
</div>
```

- 기본: `opacity 0 → 1`, `translateY(12px) → 0`, `0.4s ease-out`
- `stagger-grid`: 자식 요소에 50ms 간격으로 딜레이 자동 부여 (최대 9개)
- `prefers-reduced-motion: reduce` 시 모든 애니메이션 비활성화

### card-lift 호버 효과

카드에 `card-lift` 클래스 적용 → 호버 시 `translateY(-2px)` 리프트.

### btn-press 프레스 피드백

CTA 버튼에 `btn-press` 클래스 적용 → active 시 `scale(0.97)`.

### ink-progress-bar 진행률 바

잉크가 채워지는 애니메이션. `background-position`으로 fill 방향 제어:
```css
.ink-progress-bar {
  background: linear-gradient(90deg, var(--cta) 50%, var(--hairline) 50%);
  background-size: 200% 100%;
  animation: ink-fill 0.6s ease-out forwards;
}
```

### scroll-reveal (Progressive Enhancement)

`animation-timeline: view()` 지원 브라우저에서만 동작. 스크롤 진입 시 fade-in.

## 테마 전환

세 가지 상태를 모두 처리한다:

1. **기본(system)**: `prefers-color-scheme` 미디어 쿼리로 자동 전환
2. **수동 다크**: `:root[data-theme="dark"]`에서 토큰 재정의
3. **수동 라이트**: `:root[data-theme="light"]`에서 토큰 재정의

```
:root                        → 라이트 기본값
@media (prefers-color-scheme: dark) → 다크 토큰 재정의
:root[data-theme="dark"]     → 강제 다크
:root[data-theme="light"]    → 강제 라이트
```

## 종이 질감 (Grain)

`--grain` 토큰으로 `body`에 미세한 fractalNoise SVG 오버레이 적용:
- 라이트: `opacity: 0.03`
- 다크: `opacity: 0.025`

```css
body {
  background: var(--paper);
  background-image: var(--grain);
  background-size: 256px 256px;
}
```

## 접근성

- 모든 인터랙티브 요소에 `:focus-visible` 아웃라인 (`2px solid var(--archive)`, offset `2px`)
- 터치 타깃 최소 44px (`min-h-11`)
- `prefers-reduced-motion: reduce` 시 모든 애니메이션/전환 비활성화
- ARIA 랜드마크 라벨: header, aside, feed section, footer
- `text-wrap: balance`로 제목 줄바꿈 최적화

## 이미지 공유 (Share Image)

Canvas API로 생성하는 두 가지 포맷:

### 카드 이미지 (1080×auto)

- 배경: `--paper` → `--surface` 내부 카드
- 본문: 600 weight, 52px, 시스템 산세리프
- 출처: 모노스페이스, 28px, 테두리 태그
- 서명: 글적 글리프 + 워드마크 우하단

### 배경화면 (1080×1920)

- 배경: `#faf8f4` (warm white)
- 동적 폰트 크기 (4단계, 글자 수 기반)
- 균등 줄바꿈 알고리즘 (구두점 → 공백 → 글자 단위 폴백)
- 세로 중앙 배치, 가로 중앙 정렬
- 서명: 하단 중앙

## 파일 구조

```
src/app/globals.css          — 토큰 정의, 전역 스타일, 애니메이션
src/app/layout.tsx           — Literata 폰트 로드, ThemeProvider
src/components/              — 재사용 컴포넌트
src/lib/share-image.ts       — Canvas 이미지 생성 로직
public/brand/                — 로고 글리프, 마스코트 SVG
```
