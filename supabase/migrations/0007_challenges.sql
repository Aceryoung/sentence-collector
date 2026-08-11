-- 필사 챌린지: 기간 동안 목표 달성을 함께 하는 기능
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  description text,
  duration_days int not null check (duration_days > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.challenge_participants (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  progress int not null default 0,
  joined_at timestamptz not null default now(),
  unique (challenge_id, user_id)
);

create index if not exists challenge_participants_challenge_idx
  on public.challenge_participants (challenge_id);
create index if not exists challenge_participants_user_idx
  on public.challenge_participants (user_id);

alter table public.challenges enable row level security;
alter table public.challenge_participants enable row level security;

create policy "challenges are publicly readable"
  on public.challenges for select using (true);

create policy "challenge_participants are publicly readable"
  on public.challenge_participants for select using (true);

create policy "authenticated users can join challenges"
  on public.challenge_participants for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can update their own progress"
  on public.challenge_participants for update
  to authenticated
  using (auth.uid() = user_id);
