-- 문장 수집가 초기 스키마
-- profiles: auth.users 1:1. nickname은 컬럼만 두고 MVP 범위에서는 UI로 채우지 않음
-- (2026-07-27 /plan-eng-review 결정 — 카드에 작성자 표시가 없어 당장 필요하지 않음)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text,
  created_at timestamptz not null default now()
);

-- 신규 가입 시 profiles 행을 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- sentences: 인용문(source 있음) + 자작 문장(source 없음)
create table if not exists public.sentences (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0 and char_length(body) <= 500),
  source text check (source is null or char_length(source) <= 200),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists sentences_author_id_idx on public.sentences (author_id);
create index if not exists sentences_created_at_idx on public.sentences (created_at desc)
  where deleted_at is null;

-- likes: 비회원도 좋아요 가능 — device_id(클라이언트 발급 식별자)로 중복 방지
-- 한계: 시크릿모드/쿠키 삭제로 우회 가능 (PLAN.md에 명시된 의도된 트레이드오프)
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  sentence_id uuid not null references public.sentences (id) on delete cascade,
  device_id text not null,
  created_at timestamptz not null default now(),
  unique (sentence_id, device_id)
);

create index if not exists likes_sentence_id_idx on public.likes (sentence_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.sentences enable row level security;
alter table public.likes enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "sentences are publicly readable"
  on public.sentences for select
  using (deleted_at is null);

create policy "authenticated users can insert their own sentences"
  on public.sentences for insert
  to authenticated
  with check (auth.uid() = author_id);

-- 소프트 삭제는 MVP에서 관리자가 Supabase 대시보드(서비스 롤)로 직접 처리 —
-- 별도 update 정책을 두지 않아 일반 사용자는 자기 글도 앱을 통해 지울 수 없다.

create policy "likes are publicly readable"
  on public.likes for select
  using (true);

create policy "anyone can like a sentence"
  on public.likes for insert
  to anon, authenticated
  with check (true);
