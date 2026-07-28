-- 좋아요 취소(토글) 기능 추가: likes 행 삭제를 허용하는 정책이 없어서 추가한다.
-- device_id는 클라이언트가 자체 발급하는 비인증 식별자라 "내 기기의 좋아요만 삭제"를
-- DB 레벨에서 강제할 수 없다 — 0001_init.sql의 좋아요 anon insert 정책과 동일한
-- 신뢰 기반 트레이드오프(PLAN.md에 명시된 의도된 한계)를 그대로 따른다.
create policy "anyone can remove a like"
  on public.likes for delete
  to anon, authenticated
  using (true);
