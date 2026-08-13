-- thoughts: 문장에서 영감받은 비공개 글쓰기 (소비→생산 전환)
-- 사용자가 저장한 문장 옆에 자유롭게 생각을 붙이는 기능.
-- commentary(등록자 감상)나 reflection(공개 감상)과 달리 본인만 볼 수 있다.
create table if not exists public.thoughts (
  id uuid primary key default gen_random_uuid(),
  sentence_id uuid not null references public.sentences (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists thoughts_author_idx
  on public.thoughts (author_id, created_at desc);
create index if not exists thoughts_sentence_idx
  on public.thoughts (sentence_id);

alter table public.thoughts enable row level security;

create policy "users can view their own thoughts"
  on public.thoughts for select
  using (auth.uid() = author_id);

create policy "users can insert their own thoughts"
  on public.thoughts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "users can update their own thoughts"
  on public.thoughts for update
  to authenticated
  using (auth.uid() = author_id);

create policy "users can delete their own thoughts"
  on public.thoughts for delete
  to authenticated
  using (auth.uid() = author_id);
