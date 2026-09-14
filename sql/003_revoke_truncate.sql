-- 과한 권한 회수 — 2026-09-14, `radiation-lab/sql/platform-verify.sql` 이 잡았다.
--
-- ★★ **RLS 는 TRUNCATE 를 막지 않는다.** 정책은 행 단위로 걸리는데 TRUNCATE 는 테이블
--    단위라 정책을 아예 타지 않는다. 권한 자체를 회수해야 한다.
--    실측으로 확인했다 — anon 이 `feedback` 을, 로그인한 아무나 남의 `calc_results` 를
--    통째로 비울 수 있었다(대조군 둘 다 「남은 행 0」).
--
-- ★ 왜 생겼나: Supabase 는 public 스키마의 새 테이블에 anon·authenticated 기본 권한을
--   붙인다. `calc_results.sql` 은 anon 회수를 적었지만 **TRUNCATE·REFERENCES·TRIGGER 는
--   authenticated 에게 남았고**, 카운터 표는 회수 자체를 빠뜨렸다.
--   RLS 를 켜 놓아 「잠겼다」고 본 것이 착각이었다.

-- ── anon 은 이 표들에 한 칸도 갖지 않는다 ──────────────────────────────
revoke all on public.calc_results     from anon;
revoke all on public.calc_ref_counter from anon;
revoke all on public.feedback         from anon;   -- 쓰기는 SECURITY DEFINER 함수로만 연다

-- ── authenticated 에게는 행 단위로 필요한 것만 ─────────────────────────
revoke all on public.calc_ref_counter from authenticated;   -- 트리거만 건드린다
revoke all on public.feedback         from authenticated;

revoke truncate, references, trigger on public.calc_results from authenticated;
grant  select, insert, update, delete on public.calc_results to   authenticated;

-- ── 앞으로 만들 표에도 같은 실수가 나지 않게 ───────────────────────────
-- ★ 기본 권한 자체를 좁힌다. 이 줄이 없으면 다음 `create table` 에서 똑같이 반복된다.
alter default privileges in schema public revoke truncate, references, trigger on tables from authenticated;
alter default privileges in schema public revoke all on tables from anon;
