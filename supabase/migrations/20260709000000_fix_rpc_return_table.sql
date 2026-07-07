-- Fix: return table row so .single() returns a Map, not a scalar.
-- Look up the actual auth email from profiles (matching addEmployee flow).

drop function if exists public.get_email_by_employee_code(p_slug text, p_employee_code text);

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
  select p.email
  from employees e
  join profiles p on p.id = e.profile_id
  join organizations o on o.id = e.organization_id
  where o.slug = p_slug
    and e.employee_code = p_employee_code
    and e.status = 'active'
  limit 1;
end;
$$;
