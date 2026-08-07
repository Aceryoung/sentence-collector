-- 탈퇴해도 문장은 남기고 작성자 정보만 지운다 (익명화).
--
-- 이용약관 제10조 제2항이 "회원이 등록한 문장은 서비스 내에 유지되며 작성자
-- 정보만 삭제(익명화) 처리된다"고 공지하고 있는데, 실제 스키마는
-- author_id 가 not null + on delete cascade 라 탈퇴 시 문장이 전부 사라졌다.
-- 약관과 동작이 어긋난 상태였다.
--
-- 삭제 연쇄: auth.users → profiles(cascade) → sentences(cascade)
-- 이 마이그레이션은 마지막 고리만 set null 로 바꾼다. profiles 행은 그대로
-- 삭제되므로 작성자를 되짚을 방법이 없어져 익명화가 성립한다.

alter table public.sentences
  alter column author_id drop not null;

-- 제약 이름을 직접 쓰지 않는다. 0001 에서 이름 없이 만들어 기본 이름이 붙었지만,
-- 프로덕션에서 다른 이름으로 재생성됐을 가능성을 배제할 수 없다.
do $$
declare
  constraint_name text;
begin
  select con.conname into constraint_name
  from pg_constraint con
  join pg_attribute att
    on att.attrelid = con.conrelid
   and att.attnum = con.conkey[1]
  where con.conrelid = 'public.sentences'::regclass
    and con.contype = 'f'
    and att.attname = 'author_id';

  if constraint_name is not null then
    execute format(
      'alter table public.sentences drop constraint %I', constraint_name
    );
  end if;
end $$;

alter table public.sentences
  add constraint sentences_author_id_fkey
  foreign key (author_id) references public.profiles (id) on delete set null;

-- 익명 문장을 직접 만들 수는 없어야 한다.
-- insert 정책이 auth.uid() = author_id 이므로 author_id 가 null 이면 비교 결과가
-- NULL 이 되고, WITH CHECK 는 NULL 을 통과시키지 않는다. 즉 null 작성자는
-- 오직 탈퇴로만 생긴다. 정책은 그대로 두면 된다.
