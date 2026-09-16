-- 1. 시선의 충돌: 사용자별 감정 태그
create table sentence_user_tags (
  id uuid primary key default gen_random_uuid(),
  sentence_id uuid not null references sentences(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emotion_tag text not null check (char_length(emotion_tag) <= 20),
  created_at timestamptz not null default now(),
  unique (sentence_id, user_id)
);

alter table sentence_user_tags enable row level security;

create policy "누구나 읽기" on sentence_user_tags
  for select using (true);

create policy "로그인 사용자 본인 태그 등록" on sentence_user_tags
  for insert with check (auth.uid() = user_id);

create policy "본인 태그 수정" on sentence_user_tags
  for update using (auth.uid() = user_id);

create policy "본인 태그 삭제" on sentence_user_tags
  for delete using (auth.uid() = user_id);

create index idx_sentence_user_tags_sentence on sentence_user_tags(sentence_id);
create index idx_sentence_user_tags_user on sentence_user_tags(user_id);

-- 2. 피드백 수집
create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category text not null default 'general' check (category in ('bug', 'suggestion', 'general')),
  body text not null check (char_length(body) >= 5 and char_length(body) <= 2000),
  page_url text,
  created_at timestamptz not null default now(),
  resolved boolean not null default false
);

alter table feedback enable row level security;

create policy "로그인 사용자 피드백 등록" on feedback
  for insert with check (auth.uid() = user_id);

create policy "본인 피드백 읽기" on feedback
  for select using (auth.uid() = user_id);

-- 관리자: JWT 이메일 기반 전체 읽기/수정
create policy "관리자 피드백 전체 읽기" on feedback
  for select using (
    (auth.jwt() -> 'user_metadata' ->> 'email') = 'qbizlab@gmail.com'
    or auth.jwt() ->> 'email' = 'qbizlab@gmail.com'
  );

create policy "관리자 피드백 수정" on feedback
  for update using (
    (auth.jwt() -> 'user_metadata' ->> 'email') = 'qbizlab@gmail.com'
    or auth.jwt() ->> 'email' = 'qbizlab@gmail.com'
  );
