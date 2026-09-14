-- 계산 결과 저장 — Supabase SQL 에디터에서 한 번 실행한다.
--
-- ★ 설계 원칙
--   ① anon 키는 공개된다. 따라서 **RLS 가 유일한 방어선**이고, 정책은 auth.uid() 로만 건다.
--   ② 고유번호는 **서버가 붙인다**. 클라이언트가 정하게 하면 남의 번호를 주장할 수 있다.
--   ③ 도구는 로그인 없이 쓴다 — 저장만 로그인이 필요하다.

create table if not exists public.calc_results (
  id          bigint generated always as identity primary key,
  ref         text not null unique,                       -- RC-20260914-0001
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  tool        text not null,                              -- 도구 slug (gamma-shielding …)
  title       text,                                       -- 사용자가 붙이는 이름
  inputs      jsonb not null default '{}'::jsonb,          -- 계산 조건 전부
  outputs     jsonb not null default '{}'::jsonb,          -- 그때의 답 (재현 대조용)
  constraint calc_tool_ok  check (tool ~ '^[a-z0-9-]{2,40}$'),
  constraint calc_title_ok check (title is null or length(title) <= 200),
  constraint calc_size_ok  check (pg_column_size(inputs) + pg_column_size(outputs) <= 64000)
);

create index if not exists calc_results_user_created on public.calc_results (user_id, created_at desc);
create index if not exists calc_results_user_tool    on public.calc_results (user_id, tool);

-- 고유번호 — 날짜별 일련번호. ON CONFLICT DO UPDATE 라 동시 저장에도 번호가 겹치지 않는다.
create table if not exists public.calc_ref_counter (
  day date primary key,
  n   integer not null default 0
);
alter table public.calc_ref_counter enable row level security;
-- 정책을 하나도 만들지 않는다 = 클라이언트는 이 표에 손댈 수 없다. 아래 트리거만 쓴다.

create or replace function public.calc_next_ref() returns text
language plpgsql security definer set search_path = public as $$
declare seq integer;
begin
  insert into public.calc_ref_counter (day, n) values (current_date, 1)
  on conflict (day) do update set n = public.calc_ref_counter.n + 1
  returning n into seq;
  return 'RC-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(seq::text, 4, '0');
end $$;

-- ★ user_id 와 ref 를 **서버가 정한다**. 클라이언트가 보낸 값은 버린다.
create or replace function public.calc_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'sign-in required' using errcode = '42501';
  end if;
  new.user_id := auth.uid();
  new.ref := public.calc_next_ref();
  new.created_at := now();
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists calc_results_biu on public.calc_results;
create trigger calc_results_biu before insert on public.calc_results
  for each row execute function public.calc_before_insert();

-- 수정은 제목만 바뀌게 둔다 — ref·user_id·created_at 은 못 바꾼다.
create or replace function public.calc_before_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.ref := old.ref;
  new.user_id := old.user_id;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists calc_results_bu on public.calc_results;
create trigger calc_results_bu before update on public.calc_results
  for each row execute function public.calc_before_update();

alter table public.calc_results enable row level security;

drop policy if exists calc_select_own on public.calc_results;
drop policy if exists calc_insert_own on public.calc_results;
drop policy if exists calc_update_own on public.calc_results;
drop policy if exists calc_delete_own on public.calc_results;

create policy calc_select_own on public.calc_results
  for select to authenticated using (user_id = auth.uid());
create policy calc_insert_own on public.calc_results
  for insert to authenticated with check (true);   -- 트리거가 user_id 를 auth.uid() 로 덮는다
create policy calc_update_own on public.calc_results
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy calc_delete_own on public.calc_results
  for delete to authenticated using (user_id = auth.uid());

grant select, insert, update, delete on public.calc_results to authenticated;
grant usage on schema public to authenticated;
-- anon 에게는 아무것도 주지 않는다. 저장은 로그인한 사람만 한다.
revoke all on public.calc_results from anon;
