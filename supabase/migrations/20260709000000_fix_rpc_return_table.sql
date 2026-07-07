-- Fix: generate synthetic email from employee code instead of looking up profiles.email
-- Matches the format used by admin-portal's generateEmployeeAccount

do $$
declare
  f record;
begin
  for f in
    select proname, oid::regprocedure as sig
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'get_email_by_employee_code'
  loop
    execute 'drop function ' || f.sig || ' cascade';
  end loop;
end $$;

create or replace function public.get_email_by_employee_code(
  p_slug text,
  p_employee_code text
)
returns table(email text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select concat(e.employee_code, '@org.easyhr.app') as email
  from employees e
  join organizations o on o.id = e.organization_id
  where o.slug = p_slug
    and e.employee_code = p_employee_code
    and e.status = 'active'
  limit 1;
end;
$$;
