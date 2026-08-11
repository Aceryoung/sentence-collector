-- 알림 센터: 좋아요, 감상, 챌린지 등 서비스 알림
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('like', 'reflection', 'challenge', 'system')),
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (user_id)
  where read = false;

alter table public.notifications enable row level security;

create policy "users can read their own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can update their own notifications"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id);
