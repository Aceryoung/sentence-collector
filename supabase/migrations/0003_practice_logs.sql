-- practice_logs: 로그인 사용자가 "오늘의 필사"를 완료 표시한 기록 (필사 스트릭 계산용)
-- date는 KST 기준 캘린더 날짜(YYYY-MM-DD) — 클라이언트/서버에서 Asia/Seoul로 변환해 저장
create table if not exists public.practice_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  sentence_id uuid not null references public.sentences (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists practice_logs_user_id_idx on public.practice_logs (user_id);

alter table public.practice_logs enable row level security;

create policy "users can view their own practice logs"
  on public.practice_logs for select
  using (auth.uid() = user_id);

create policy "users can insert their own practice logs"
  on public.practice_logs for insert
  to authenticated
  with check (auth.uid() = user_id);
