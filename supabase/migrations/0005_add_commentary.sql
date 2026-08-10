-- 저작권 보호: 감상(commentary) + 감정 태그(emotion_tag) 추가
-- 타인의 저작물을 인용할 때 이용자 본인의 주관적 분류(태그)와 선택적 감상을
-- 덧붙이게 하여 저작권법 제28조 공정인용 요건의 창작적 개입을 구조적으로
-- 충족하도록 한다.
--
-- emotion_tag: 필수. 유저가 문장을 읽고 느낀 감정을 분류(큐레이션)한다.
-- commentary: 선택. 10자 이상 텍스트 감상.
-- 기존 문장(두 컬럼 모두 NULL)은 레거시로 허용한다.
alter table public.sentences
  add column if not exists commentary text;

alter table public.sentences
  add column if not exists emotion_tag text;

comment on column public.sentences.commentary is
  '이용자 본인의 감상·해석(선택, 10자 이상). 저작권법 공정인용 요건 보강.';
comment on column public.sentences.emotion_tag is
  '감정/주제 태그(필수). 유저의 주관적 큐레이션으로 창작적 개입을 구성.';
