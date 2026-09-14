-- 고유번호에 도구 약자를 넣는다 — RC-20260914-0001 → RC-GAM-20260914-0001 (2026-09-14 소유주 결정)
--
-- ★ 약자를 **표로 두지 않는다.** 슬러그에서 규칙으로 뽑으면 도구가 늘어도 따라오고,
--   화면과 DB 가 두 벌로 갈려 어긋나는 일이 없다. 규칙은 「영숫자만 남기고 앞 세 글자」.
--   현재 7종이 UNI·DEC·GAM·SPE·MDA·BET·ALA 로 전부 다르다.
--   ※ 앞 세 글자가 같은 도구가 새로 생기면 **번호를 함께 쓴다** — 겹치는 것은 약자뿐이고
--     일련번호가 이어지므로 ref 는 여전히 유일하다.

create or replace function public.calc_tool_code(slug text) returns text
language sql immutable as $$
  select upper(left(regexp_replace(lower(coalesce(slug,'')), '[^a-z0-9]', '', 'g'), 3));
$$;

-- 카운터를 (날짜, 도구)별로 바꾼다. 그러지 않으면 GAM 이 0001 다음에 0003 으로 건너뛴다.
alter table public.calc_ref_counter add column if not exists tool_code text not null default '';
alter table public.calc_ref_counter drop constraint if exists calc_ref_counter_pkey;
alter table public.calc_ref_counter add primary key (day, tool_code);

create or replace function public.calc_next_ref(p_tool text) returns text
language plpgsql security definer set search_path = public as $$
declare seq integer; code text;
begin
  code := public.calc_tool_code(p_tool);
  if length(code) < 2 then raise exception 'tool slug too short: %', p_tool; end if;
  insert into public.calc_ref_counter (day, tool_code, n) values (current_date, code, 1)
  on conflict (day, tool_code) do update set n = public.calc_ref_counter.n + 1
  returning n into seq;
  return 'RC-' || code || '-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(seq::text, 4, '0');
end $$;

drop function if exists public.calc_next_ref();

create or replace function public.calc_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'sign-in required' using errcode = '42501';
  end if;
  new.user_id := auth.uid();
  new.ref := public.calc_next_ref(new.tool);   -- ★ 도구를 넘겨 약자를 붙인다
  new.created_at := now();
  new.updated_at := now();
  return new;
end $$;

alter table public.calc_results drop constraint if exists calc_ref_shape_ok;
alter table public.calc_results add constraint calc_ref_shape_ok
  check (ref ~ '^RC-[A-Z0-9]{2,3}-[0-9]{8}-[0-9]{4,}$');
