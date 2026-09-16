-- 오늘의 단어: 관리자가 등록, 날짜별 하나의 단어
create table if not exists public.daily_words (
  id uuid primary key default gen_random_uuid(),
  word text not null check (char_length(trim(word)) > 0 and char_length(word) <= 50),
  description text check (description is null or char_length(description) <= 200),
  scheduled_date date not null unique,
  created_at timestamptz not null default now()
);

create index if not exists daily_words_date_idx on public.daily_words (scheduled_date desc);

-- 오늘의 단어 응답: 사용자가 적는 자유로운 생각
create table if not exists public.daily_word_responses (
  id uuid primary key default gen_random_uuid(),
  daily_word_id uuid not null references public.daily_words (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0 and char_length(body) <= 1000),
  created_at timestamptz not null default now(),
  unique (daily_word_id, user_id)
);

create index if not exists daily_word_responses_word_idx on public.daily_word_responses (daily_word_id);
create index if not exists daily_word_responses_user_idx on public.daily_word_responses (user_id);

-- RLS
alter table public.daily_words enable row level security;
alter table public.daily_word_responses enable row level security;

-- 단어는 누구나 볼 수 있음
create policy "daily_words are publicly readable"
  on public.daily_words for select
  using (true);

-- 응답은 누구나 볼 수 있음 (커뮤니티 공유)
create policy "daily_word_responses are publicly readable"
  on public.daily_word_responses for select
  using (true);

-- 로그인 사용자만 응답 작성 가능
create policy "authenticated users can insert responses"
  on public.daily_word_responses for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 본인 응답만 수정 가능
create policy "users can update their own responses"
  on public.daily_word_responses for update
  to authenticated
  using (auth.uid() = user_id);
