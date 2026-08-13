# 글적 — 신규 기능 상세 기획서

**작성일:** 2026-08-13  
**프로젝트:** 글적 (GEULJEOK) — 문장 수집·필사 서비스  
**범위:** 4개 신규 기능 (우선순위 순)

---

## 현재 상태 요약

### 데이터 구조
| 테이블 | 용도 | 핵심 컬럼 |
|--------|------|-----------|
| sentences | 문장 저장 | body, source, emotion_tag, commentary, author_id |
| likes | 좋아요 | sentence_id, device_id |
| practice_logs | 필사 기록 | user_id, date, sentence_id |
| reflections | 타인 감상 | sentence_id, author_id, body |
| challenges | 챌린지 | title, duration_days, starts_at, ends_at |
| notifications | 알림 | user_id, type, title, body, link, read |

### 기존 감정 태그
`위로` `동기부여` `사랑` `깨달음` `유머` `그리움` `용기` `성찰`

### 기존 페이지
- `/` 홈 — 히어로 + 오늘의 필사 CTA + 데일리 픽 + 발견하기 피드(최신 30개)
- `/write` — 문장 등록 (body + source + emotion_tag + commentary)
- `/my` — 내 보관함 + 월간 리캡 + 좋아요한 문장 + 나의 여정 링크
- `/sentences/[id]` — 상세 + 감상(reflections)
- `/practice` — 오늘의 필사
- `/ranking` `/challenges` `/notifications`

---

## 기능 1: 소비→생산 전환 (내 생각 이어쓰기)

### 왜 1순위인가
- 구현 비용이 가장 낮다 (UI 한 영역 + DB 1컬럼 또는 기존 reflections 활용)
- 글적만의 고유 UX — "문장에서 영감받아 나도 쓴다"
- 사용자가 자기 글을 쌓을수록 이탈 비용 증가(lock-in)
- 인스타그램이 구조적으로 제공할 수 없는 영역

### 핵심 콘셉트
> 저장한 문장 옆에 "이 문장에서 떠오른 내 생각"을 짧게 붙인다.  
> 문장 소비자가 자연스럽게 생산자로 전환되는 흐름.

### 기존 기능과의 차이

| 구분 | commentary (나의 감상) | reflection (감상) | **thought (내 생각)** |
|------|----------------------|-------------------|---------------------|
| 작성자 | 문장 등록자 본인 | 누구든 | 문장을 저장한 본인 |
| 시점 | 등록 시 1회 | 상세 페이지에서 언제든 | 언제든, 여러 번 가능 |
| 목적 | 저작권 공정인용 | 타인과의 대화 | **나만의 글쓰기 연습** |
| 공개 | 공개 | 공개 | **비공개 (본인만)** |
| 길이 | 10~500자 | 10~500자 | **제한 없음 (자유)** |

### 사용자 시나리오

```
1. 홈 피드에서 마음에 드는 문장 발견
2. 문장 상세 페이지 진입
3. "이 문장에서 떠오른 생각" 영역에 자유롭게 글을 씀
4. 저장 → 내 보관함의 "내 글" 탭에서 모아보기
5. 시간이 지나 다시 꺼내보며 과거의 나를 만남
```

### 데이터 설계

```sql
-- 새 테이블: thoughts (내 생각 — 비공개 글쓰기)
create table if not exists public.thoughts (
  id uuid primary key default gen_random_uuid(),
  sentence_id uuid not null references public.sentences (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index thoughts_author_idx on public.thoughts (author_id, created_at desc);
create index thoughts_sentence_idx on public.thoughts (sentence_id);

-- RLS: 본인만 CRUD
alter table public.thoughts enable row level security;

create policy "users can view their own thoughts"
  on public.thoughts for select using (auth.uid() = author_id);
create policy "users can insert their own thoughts"
  on public.thoughts for insert to authenticated
  with check (auth.uid() = author_id);
create policy "users can update their own thoughts"
  on public.thoughts for update using (auth.uid() = author_id);
create policy "users can delete their own thoughts"
  on public.thoughts for delete using (auth.uid() = author_id);
```

### UI 구성

#### 1) 문장 상세 페이지 (`/sentences/[id]`)
기존 감상(reflections) 섹션 위에 "내 생각" 영역 추가:

```
┌─────────────────────────────────┐
│  "마음이 힘들 때는 걷는다..."    │  ← 문장 본문
│  — 무라카미 하루키               │
│  🏷 위로                        │
├─────────────────────────────────┤
│  ✏️ 내 생각                     │  ← 새 영역
│  ┌─────────────────────────────┐│
│  │ 나도 요즘 많이 걷는다.       ││
│  │ 걸을 때만큼은 머리가         ││
│  │ 비워지는 기분이 든다...      ││
│  └─────────────────────────────┘│
│  2026.08.13 · 수정 · 삭제       │
│                                 │
│  [+ 또 다른 생각 남기기]         │  ← 같은 문장에 여러 개 가능
├─────────────────────────────────┤
│  💬 Reflections (3)             │  ← 기존 공개 감상
│  ...                            │
└─────────────────────────────────┘
```

- 로그인 사용자에게만 노출
- 다른 사용자의 thoughts는 보이지 않음
- 비어 있으면 "이 문장에서 떠오른 생각을 자유롭게 적어보세요" 플레이스홀더

#### 2) 내 보관함 (`/my`) — "내 글" 섹션
기존 "내가 좋아요한 문장" 아래에 추가:

```
┌─────────────────────────────────┐
│  ✏️ 내가 쓴 글 (12)             │
│                                 │
│  "나도 요즘 많이 걷는다..."      │  ← thought.body 미리보기
│   ↳ 마음이 힘들 때는 걷는다...   │  ← 연결된 문장
│   8.13                          │
│                                 │
│  "겨울이 다가올수록..."          │
│   ↳ 사랑이란 결국 기다림이다     │
│   8.10                          │
└─────────────────────────────────┘
```

- 시간순 정렬 (최신 먼저)
- 클릭 시 해당 문장 상세 페이지로 이동

### 구현 범위 (MVP)

| 항목 | 포함 여부 |
|------|----------|
| thought CRUD | ✅ |
| 문장 상세에서 작성/수정/삭제 | ✅ |
| /my에서 모아보기 | ✅ |
| 같은 문장에 여러 thought | ✅ |
| 글자 수 제한 | ❌ 없음 (자유 글쓰기) |
| 공개 전환 옵션 | ❌ 향후 |
| 마크다운 지원 | ❌ 향후 |
| 글쓰기 통계 (총 단어 수 등) | ❌ 향후 |

---

## 기능 2: 개인 아카이브 검색

### 왜 2순위인가
- "저장은 했는데 다시 못 찾는다"는 인스타 최대 불만을 직격
- 기존 emotion_tag 데이터를 즉시 활용 가능
- 기능 3(상황 추천)의 인프라 역할

### 현재 검색 상태
`/my`의 `MyArchive` 컴포넌트에 클라이언트 사이드 텍스트 검색만 존재 (내 문장만, body+source 텍스트 매칭).

### 확장 방향

```
현재:  텍스트 검색 (내 문장만)
목표:  텍스트 + 감정 태그 필터 + 출처 필터 + 정렬 옵션
```

### UI 구성

#### 1) `/my` 보관함 검색 강화

```
┌─────────────────────────────────┐
│  🔍 [문장, 출처, 감상 검색     ]│
│                                 │
│  태그:  [위로] [동기부여] [사랑] │  ← 감정 태그 필터 (다중 선택)
│         [깨달음] [유머] [그리움] │
│         [용기] [성찰]           │
│                                 │
│  정렬:  [최신순 ▾]              │  ← 최신순 / 좋아요순 / 오래된순
├─────────────────────────────────┤
│  검색 결과 (3개)                │
│  ┌───────────────────────────┐  │
│  │ "마음이 힘들 때는..."     │  │
│  │ 🏷 위로  ♡ 12            │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

#### 2) 홈 피드 감정 태그 필터

현재 `/` 홈의 "발견하기" 섹션에 태그 칩 바를 추가:

```
── 발견하기 ──────────────────────
[전체] [위로] [동기부여] [사랑] ...  ← 가로 스크롤

┌───────────────────────────┐
│ "사랑이란 결국..."         │
│ 🏷 사랑  ♡ 24             │
└───────────────────────────┘
```

- 태그 선택 시 서버 쿼리 파라미터로 필터 (`?tag=위로`)
- URL 공유 가능 (deep link)

### 데이터 설계

DB 변경 없음. 기존 `emotion_tag` 컬럼과 Supabase의 `ilike` 또는 `textSearch` 활용.

```typescript
// 검색 쿼리 예시
const query = supabase
  .from("sentences")
  .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
  .is("deleted_at", null);

if (emotionTag) query.eq("emotion_tag", emotionTag);
if (searchText) query.or(`body.ilike.%${searchText}%,source.ilike.%${searchText}%`);
if (sortBy === "likes") query.order("likes(count)", { ascending: false });
else query.order("created_at", { ascending: false });
```

### 구현 범위 (MVP)

| 항목 | 포함 여부 |
|------|----------|
| 감정 태그 필터 (/my) | ✅ |
| 감정 태그 필터 (홈) | ✅ |
| 텍스트 검색 (body + source + commentary) | ✅ |
| 정렬 (최신/좋아요/오래된) | ✅ |
| 검색어 URL 파라미터 | ✅ |
| 풀텍스트 검색 (pg_trgm) | ❌ 향후 — 문장 수 1000+ 시 |
| 출처별 그룹핑 | ❌ 향후 |
| 자동 태그 추천 (AI) | ❌ 향후 |

---

## 기능 3: 상황 기반 추천

### 왜 3순위인가
- 기능 2의 태그 인프라 위에 자연스럽게 확장
- 리텐션의 핵심 — "지금 내 기분에 맞는 문장"
- 다만 콘텐츠 볼륨이 일정 수준 이상이어야 의미 있음

### 전제 조건
- 감정 태그가 붙은 문장이 태그당 최소 5개 이상
- 기능 2의 태그 필터가 먼저 구현되어 있어야 함

### 핵심 콘셉트
> "지금 기분"을 고르면, 그 감정에 맞는 문장을 골라준다.  
> 알고리즘이 아닌, 사람이 붙인 감정 태그 기반 큐레이션.

### 사용자 시나리오

```
시나리오 A — 능동적 탐색
1. 홈 화면 상단 "지금 어떤 문장이 필요해요?"
2. 감정 칩 선택: [위로] [동기부여] [용기] ...
3. 해당 태그의 문장 중 랜덤 3개 카드로 표시
4. "다른 문장 보기" 새로고침 가능
5. 마음에 들면 좋아요 / 상세 보기

시나리오 B — 수동적 수신 (향후)
1. 매일 오전 8시 푸시 알림
2. "오늘의 위로 한 문장" — 랜덤 문장 1개
3. 탭하면 문장 상세로 이동
```

### UI 구성

#### 홈 화면 — "지금 필요한 문장" 섹션

히어로와 오늘의 필사 CTA 사이에 삽입:

```
┌─────────────────────────────────┐
│  마음에 닿은 문장을 모으다       │  ← 히어로
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  지금 어떤 문장이 필요해요?      │
│                                 │
│  [😌 위로] [💪 동기부여] [❤️ 사랑]│  ← 감정 칩 (이모지 포함)
│  [💡 깨달음] [😄 유머] [🌙 그리움]│
│  [🦁 용기] [🪞 성찰]            │
│                                 │
│  ── 위로가 필요한 당신에게 ──    │  ← 선택 후 나타남
│  ┌───────────────────────────┐  │
│  │ "괜찮아, 다 지나가는       │  │
│  │  일이니까..."              │  │
│  │ — 이해인                  │  │
│  └───────────────────────────┘  │
│  [↻ 다른 문장 보기]             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  오늘의 필사 보러가기 →          │  ← CTA
└─────────────────────────────────┘
```

### 데이터 설계

DB 변경 없음. 서버 컴포넌트에서 태그별 랜덤 쿼리:

```typescript
// 태그별 랜덤 문장 3개
const { data } = await supabase
  .from("sentences")
  .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
  .eq("emotion_tag", selectedTag)
  .is("deleted_at", null)
  .limit(3);

// Supabase는 ORDER BY random() 미지원이므로
// 클라이언트에서 전체 id 목록 중 랜덤 3개 선택 후 .in("id", pickedIds) 사용
// (기존 daily-pick.ts의 pickDailyId 패턴과 동일)
```

### 구현 범위 (MVP)

| 항목 | 포함 여부 |
|------|----------|
| 홈 감정 칩 → 랜덤 문장 표시 | ✅ |
| "다른 문장 보기" 새로고침 | ✅ |
| 태그별 문장 수 부족 시 안내 | ✅ ("아직 문장이 부족해요") |
| 클라이언트 인터랙션 (서버 컴포넌트 + 클라이언트 상태) | ✅ |
| 푸시 알림 | ❌ 향후 — Supabase Edge Function + FCM |
| 개인화 (좋아요 기반 취향 학습) | ❌ 향후 |
| 시간대별 추천 (아침엔 동기부여, 밤엔 위로) | ❌ 향후 |

---

## 기능 4: 필사 기록화 확장

### 왜 4순위인가
- 기존 `/practice` + `practice_logs` + 스트릭 시스템이 이미 작동 중
- 확장은 가치 있지만, 1~3순위 대비 신규 사용자 유입 효과가 낮음
- 타이핑 필사 MVP만 먼저, 손글씨는 기술적 허들이 높아 나중에

### 현재 필사 시스템
- `/practice` — 랜덤 문장 1개 표시 + "필사 완료" 버튼 (하루 1회)
- `practice_logs` — user_id + date + sentence_id (날짜당 1회)
- 스트릭 배지 — 연속 필사 일수 표시
- 월간 리캡 — `/my`에서 등록 문장 수 + 받은 좋아요

### 확장 방향

```
현재:  "필사 완료" 버튼만 → 기록은 날짜+문장id뿐
목표:  실제 타이핑 필사 → 원문 대조 → 정확도 기록 → 아카이브
```

### 사용자 시나리오

```
1. /practice 진입
2. 오늘의 문장이 위에 표시됨 (현재와 동일)
3. 아래에 타이핑 입력 영역이 나타남
4. 원문을 보며 한 글자씩 타이핑
5. 실시간으로 맞은 글자/틀린 글자 하이라이팅
6. 완료 시 정확도 표시 (예: 98%)
7. practice_logs에 정확도 + 소요시간 기록
8. /my/journey에서 필사 히스토리 조회 가능
```

### UI 구성

#### `/practice` 페이지 확장

```
┌─────────────────────────────────┐
│  오늘의 필사                     │
│  🔥 7일째 연속 필사 중           │
├─────────────────────────────────┤
│                                 │
│  "진짜 여행은 새로운 풍경을      │  ← 원문 (반투명)
│   보는 것이 아니라 새로운        │
│   눈을 가지는 것이다"            │
│   — 마르셀 프루스트              │
│                                 │
│  ┌─────────────────────────────┐│
│  │ 진짜 여행은 새로운 풍겨을   ││  ← 타이핑 영역
│  │ 보는 것이 아니라 새로운 _   ││     "겨→겨" 빨간 표시
│  └─────────────────────────────┘│
│                                 │
│  진행률: ████████░░ 72%          │
│                                 │
├─────────────────────────────────┤
│  (완료 후)                       │
│  🎉 필사 완료!                   │
│  정확도: 98%  소요시간: 2분 30초  │
│  [홈으로] [내 필사 기록 보기]     │
└─────────────────────────────────┘
```

#### `/my/journey` — 필사 히스토리 확장

기존 활동 히트맵 아래에 필사 기록 리스트 추가:

```
┌─────────────────────────────────┐
│  📝 필사 기록                    │
│                                 │
│  8.13  "진짜 여행은..."  98%  2m │
│  8.12  "사랑이란 결국..."  100% 1m│
│  8.11  "마음이 힘들..."   95%  3m│
│  ...                            │
│  [더 보기]                       │
└─────────────────────────────────┘
```

### 데이터 설계

기존 `practice_logs` 테이블에 컬럼 추가:

```sql
-- practice_logs 확장
alter table public.practice_logs
  add column if not exists typed_text text,
  add column if not exists accuracy real,
  add column if not exists duration_seconds int;

comment on column public.practice_logs.typed_text is '사용자가 실제 타이핑한 텍스트';
comment on column public.practice_logs.accuracy is '정확도 (0.0~1.0)';
comment on column public.practice_logs.duration_seconds is '소요시간 (초)';
```

### 정확도 계산 로직

```typescript
// 글자 단위 비교 (레벤슈타인 거리 아님 — 단순 1:1 비교)
function calculateAccuracy(original: string, typed: string): number {
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  const o = norm(original);
  const t = norm(typed);
  const maxLen = Math.max(o.length, t.length);
  if (maxLen === 0) return 1;
  
  let matches = 0;
  for (let i = 0; i < Math.min(o.length, t.length); i++) {
    if (o[i] === t[i]) matches++;
  }
  return matches / maxLen;
}
```

### 구현 범위 (MVP)

| 항목 | 포함 여부 |
|------|----------|
| 타이핑 입력 영역 | ✅ |
| 실시간 맞/틀 하이라이팅 | ✅ |
| 정확도 계산 + 저장 | ✅ |
| 소요시간 측정 + 저장 | ✅ |
| 진행률 바 | ✅ |
| /my/journey에 기록 리스트 | ✅ |
| 기존 "필사 완료" 버튼 유지 (타이핑 없이도 가능) | ✅ |
| 손글씨 사진 촬영 인증 | ❌ 향후 |
| OCR 기반 손글씨 정확도 | ❌ 향후 |
| 필사 난이도 선택 (짧은/긴 문장) | ❌ 향후 |
| 타이핑 속도 통계 | ❌ 향후 |

---

## 구현 로드맵

### Phase A — 소비→생산 전환 (1~2일)
1. `thoughts` 테이블 마이그레이션
2. `/sentences/[id]` — ThoughtForm 컴포넌트 (작성/수정/삭제)
3. `/my` — "내가 쓴 글" 섹션
4. 빌드 검증 + 커밋

### Phase B — 아카이브 검색 (1~2일)
1. 홈 감정 태그 칩 바 (URL 파라미터 연동)
2. `/my` 검색 강화 (태그 필터 + 정렬)
3. 서버 쿼리 최적화 (태그 인덱스)
4. 빌드 검증 + 커밋

### Phase C — 상황 추천 (1일)
1. 홈 "지금 필요한 문장" 섹션 (클라이언트 컴포넌트)
2. 태그별 랜덤 추출 로직 (기존 daily-pick 패턴 활용)
3. "다른 문장 보기" 인터랙션
4. 빌드 검증 + 커밋

### Phase D — 필사 기록화 (2일)
1. `practice_logs` 컬럼 추가 마이그레이션
2. `/practice` — TypingPractice 클라이언트 컴포넌트
3. 정확도 계산 유틸 (TDD)
4. `/my/journey` — 필사 기록 리스트
5. 빌드 검증 + 커밋

### 총 예상: 5~7일

---

## 결정 사항 (2026-08-13 확정)

| 항목 | 결정 | 근거 |
|------|------|------|
| thought 공개 여부 | **비공개 고정** (향후 "이 글 공개하기" 토글 추가 가능) | 심리적 안전감 확보 → 글쓰기 습관 형성 우선. 비공개→공개 확장은 쉽지만 역방향은 복잡 |
| 감정 태그 | **프리셋 8개 유지 + 사용자 커스텀 태그 허용** | emotion_tag가 이미 text 타입이라 구현 단순. 홈 필터는 프리셋만, /my 필터에서 커스텀 포함 |
| 필사 스킵 | **기존 "완료" 버튼 유지** — 타이핑 필사는 선택 옵션 | 허들을 높이지 않음 |

## 미확정 사항

| 항목 | 현재 가정 | 결정 필요 |
|------|----------|----------|
| 추천 알고리즘 | 순수 태그 매칭 + 랜덤 | 좋아요 가중치 적용 여부 |
| 필사 미완료 저장 | 미지원 | 중간 저장 기능 필요 여부 |

---

## 제약 사항

- **Supabase Free 플랜:** DB 500MB, Edge Functions 500K 호출/월 — 현재 여유 있음
- **푸시 알림:** Supabase 자체 푸시 미지원. FCM + Edge Function 조합 필요 → 기능 3 향후 확장 시
- **풀텍스트 검색:** `pg_trgm` 확장 필요. Supabase에서 활성화 가능하나 MVP에선 `ilike` 충분
- **실시간 타이핑 비교:** 순수 클라이언트 로직으로 서버 부하 없음
