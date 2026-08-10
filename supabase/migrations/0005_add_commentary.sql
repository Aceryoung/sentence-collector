-- 저작권 보호: 나의 감상(commentary) 필수 필드 추가
-- 타인의 저작물을 인용할 때 이용자 본인의 해석·감상을 반드시 덧붙이게 하여
-- 저작권법 제28조(공표된 저작물의 인용) 요건 중 "보도·비평·교육·연구 등을
-- 위한 정당한 범위 안에서의 공정한 관행"을 구조적으로 충족하도록 한다.
--
-- 기존 문장(commentary IS NULL)은 레거시로 허용하되, 앱에서는 신규 등록 시
-- 30자 이상을 강제한다.
alter table public.sentences
  add column if not exists commentary text;

-- 신규 등록 시 30자 미만 감상을 DB 수준에서도 차단하는 제약은 앱 레벨에서
-- 이미 검증하므로 추가하지 않는다. 기존 데이터(NULL)가 있어 NOT NULL 제약도
-- 걸지 않는다.
comment on column public.sentences.commentary is
  '이용자 본인의 감상·해석. 저작권법 공정인용 요건 보강 목적으로 30자 이상 필수(앱 검증).';
