-- 문장 상세보기: 다른 사용자가 문장에 감상(reflection)을 남길 수 있다.
-- commentary는 등록자 본인의 한 줄 감상, reflection은 누구든 남기는 독후감.
create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  sentence_id uuid not null references public.sentences (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) >= 10 and char_length(body) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists reflections_sentence_id_idx
  on public.reflections (sentence_id, created_at desc);

alter table public.reflections enable row level security;

create policy "reflections are publicly readable"
  on public.reflections for select
  using (true);

create policy "authenticated users can insert reflections"
  on public.reflections for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "users can delete their own reflections"
  on public.reflections for delete
  to authenticated
  using (auth.uid() = author_id);
