-- practice_logs 확장: 타이핑 필사 기록 (정확도 + 소요시간)
-- 기존 "완료" 버튼 방식도 유지 — 이 컬럼들은 nullable이므로
-- 타이핑 없이 완료한 기록은 NULL로 남는다.
alter table public.practice_logs
  add column if not exists typed_text text,
  add column if not exists accuracy real,
  add column if not exists duration_seconds int;

comment on column public.practice_logs.typed_text is '사용자가 실제 타이핑한 텍스트';
comment on column public.practice_logs.accuracy is '정확도 (0.0~1.0)';
comment on column public.practice_logs.duration_seconds is '소요시간 (초)';
