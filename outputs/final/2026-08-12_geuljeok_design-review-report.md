# 글적(GEULJEOK) UI 디자인 리뷰 리포트

> 리뷰 일자: 2026-08-12
> 리뷰 범위: 전체 14개 라우트, 11개 컴포넌트
> 초기 디자인 완성도: 6/10

---

## 종합 점수표

| Pass | 영역 | Before | After | 상태 |
|------|------|--------|-------|------|
| 1 | Information Architecture | 6/10 | 10/10 | 🔴 4건 결정 완료 |
| 2 | Interaction State Coverage | 3/10 | 10/10 | 🔴 3건 결정 완료 |
| 3 | User Journey & Emotional Arc | 5/10 | 10/10 | 🟡 2건 결정 완료 |
| 4 | AI Slop Risk | 8/10 | 10/10 | 🟢 1건 결정 완료 |
| 5 | Design System Alignment | 7/10 | 9/10 | 🟡 1건 결정 완료 |
| 6 | Responsive & Accessibility | 5/10 | 9/10 | 🟡 2건 결정 완료 |
| 7 | Unresolved Design Decisions | 4/10 | 10/10 | 🔴 2건 결정 완료 |

**총 15건 이슈 발견, 15건 결정 완료**

---

## 결정 사항 전체 목록

### Pass 1: Information Architecture

| # | 이슈 | 결정 |
|---|------|------|
| IA-1 | 비로그인 네비게이션 축소 | TopBar에 '필사' 링크 추가 + 홈 하단 기능 미리보기 섹션 |
| IA-2 | 모바일 네비 비대칭 | 모바일 하단 네비바(홈/필사/등록/보관함) 도입 |
| IA-3 | 피드 스케일링 | 무한 스크롤 (초기 10개 + 하단 도달 시 추가 로드) |
| IA-4 | 카드→상세 어포던스 | 카드 전체 클릭 + hover 힌트 + 감상 수 표시 |

### Pass 2: Interaction State Coverage

| # | 이슈 | 결정 |
|---|------|------|
| ST-1 | 로딩 상태 없음 | 모든 주요 라우트에 loading.tsx + 스켈레톤 UI |
| ST-2 | 에러 상태 없음 | error.tsx + 부분 폴백 + 마스코트 에러 메시지 |
| ST-3 | 폼 피드백 없음 | 토스트 시스템 + 좋아요 하트 팝 + 에러 표시 |

### Pass 3: User Journey & Emotional Arc

| # | 이슈 | 결정 |
|---|------|------|
| JN-1 | 등록 직후 감정 보상 없음 | 마일스톤 보상 (마스코트 축하 + 배지 연동) |
| JN-2 | 재방문 개인화 부족 | 맞춤형 홈 (인사 카드 + 활동 요약) |

### Pass 4: AI Slop Risk

| # | 이슈 | 결정 |
|---|------|------|
| SL-1 | 모션 거의 없음 | 의도적 모션 2-3개 (fade-in, 마스코트 바운스, 하트 팝) |

### Pass 5: Design System Alignment

| # | 이슈 | 결정 |
|---|------|------|
| DS-1 | DESIGN.md 부재 | DESIGN.md 생성 (토큰, 컴포넌트, 타이포, 스페이싱 문서화) |

### Pass 6: Responsive & Accessibility

| # | 이슈 | 결정 |
|---|------|------|
| A1-1 | 터치 타겟 + 키보드 | TopBar 링크 min-h-[44px] + 햄버거 포커스 트래핑 |
| A1-2 | ARIA 랜드마크 부족 | role, aria-label, aria-pressed, skip-to-content 추가 |

### Pass 7: Unresolved Design Decisions

| # | 이슈 | 결정 |
|---|------|------|
| DD-1 | 빈 상태 불일관 | EmptyState 컴포넌트 전 페이지 통일 |
| DD-2 | 긴 문장 잘림 정책 없음 | 3줄 잘림 + 더보기 → 상세 페이지 |

---

## 이미 잘 된 점 (NOT in scope)

- **브랜드 아이덴티티**: Literata 세리프 + 종이 그레인 + 마스코트 — AI slop 아님
- **컬러 시스템**: Deep Ink Blue CTA + Accented Coral 포인트 — 의도적이고 일관적
- **다크모드**: prefers-color-scheme + data-theme 이중 지원
- **CSS 토큰**: 모든 색상/그림자/radius가 변수화
- **user-text 유틸**: word-break: keep-all 한국어 줄바꿈 최적화
- **컴포넌트 재사용**: EmptyState, SentenceCard, BrandMascot 패턴
- **타이포그래피**: -0.02em 헤드라인 + 1.7 본문 행간 — 프리미엄 문장 아카이브 인상
- **법적 페이지**: 이용약관, 개인정보처리방침 완비

---

## 구현 우선순위 (권장)

### P0 — 즉시 (사용자 경험 기본)
1. **ST-1** loading.tsx 스켈레톤 UI (모든 주요 라우트)
2. **ST-2** error.tsx 에러 상태
3. **DD-1** EmptyState 통일

### P1 — 단기 (핵심 UX 개선)
4. **IA-2** 모바일 하단 네비바
5. **IA-4** SentenceCard 전체 클릭 + 어포던스
6. **DD-2** 3줄 잘림 정책
7. **ST-3** 토스트 시스템
8. **A1-1** 터치 타겟 44px

### P2 — 중기 (경험 강화)
9. **IA-1** 비로그인 네비 + 기능 미리보기
10. **IA-3** 무한 스크롤
11. **JN-1** 마일스톤 보상
12. **SL-1** 의도적 모션 2-3개
13. **A1-2** ARIA 랜드마크

### P3 — 장기 (완성도)
14. **JN-2** 맞춤형 홈
15. **DS-1** DESIGN.md 생성

---

## 미확정 사항

- 사용자 프로필/아바타 시스템 (감상문, 랭킹에서 작성자 구분)
- 다크모드에서 공유 이미지 처리
- 삭제한 문장의 UI 복구 수단
