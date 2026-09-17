-- INSERT 정책이 트리거 하나에 기대고 있었다 — 정책 자신도 같은 것을 확인하게 한다 (2026-09-16)
--
-- ★ 그전 정책은 `with check (true)` 였다. 지금은 BEFORE INSERT 트리거
--   (`calc_before_insert`)가 `new.user_id := auth.uid()` 로 덮으므로 **결과는 안전하다** —
--   RLS 의 WITH CHECK 는 BEFORE 트리거 **뒤에** 평가되기 때문이다.
-- ★★ 그런데 그것은 **방어선이 하나**라는 뜻이다. 트리거가 지워지거나(`drop trigger`),
--   이름이 바뀌거나, 새 환경에서 `calc_results.sql` 의 일부만 실행되면 **정책은 아무것도
--   막지 않는다.** 정책과 트리거가 **같은 것을 각자** 확인하게 두면 하나가 빠져도 남는다.
-- ★ 동작은 바뀌지 않는다 — 정상 경로에서는 트리거가 이미 auth.uid() 를 넣어 두었다.

drop policy if exists calc_insert_own on public.calc_results;
create policy calc_insert_own on public.calc_results
  for insert to authenticated with check (user_id = auth.uid());

-- ── 적대적 확인 (SQL 에디터에서 로그인한 세션으로) ─────────────────────
--   ① 정상 저장이 되는가
--        insert into public.calc_results (tool, inputs, outputs)
--        values ('units', '{}'::jsonb, '{}'::jsonb) returning ref, user_id;
--   ② 트리거를 잠시 떼고 남의 user_id 를 주장하면 막히는가 (확인 뒤 반드시 되돌린다)
--        alter table public.calc_results disable trigger calc_results_biu;
--        insert into public.calc_results (tool, user_id, ref, inputs, outputs)
--        values ('units', '00000000-0000-0000-0000-000000000000',
--                'RC-UNI-20260101-0001', '{}'::jsonb, '{}'::jsonb);
--        -- 기대: new row violates row-level security policy
--        alter table public.calc_results enable trigger calc_results_biu;
