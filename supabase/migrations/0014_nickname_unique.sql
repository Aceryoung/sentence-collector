-- 닉네임 중복 방지: profiles.nickname에 unique 인덱스 추가
-- null은 허용 (닉네임 미설정 사용자)

-- 기존 auth.users의 nickname을 profiles로 동기화
update public.profiles p
set nickname = (
  select raw_user_meta_data->>'nickname'
  from auth.users u
  where u.id = p.id
)
where p.nickname is null
  and exists (
    select 1 from auth.users u
    where u.id = p.id
      and u.raw_user_meta_data->>'nickname' is not null
      and u.raw_user_meta_data->>'nickname' != ''
  );

-- unique 인덱스 (null 제외)
create unique index if not exists profiles_nickname_unique
  on public.profiles (nickname)
  where nickname is not null;
