-- Simple email lookup RPC (no password verification - Supabase Auth handles that)
-- Replaces the previous sign_in_employee RPC that required dual password management

-- Drop the old complex RPC
drop function if exists public.sign_in_employee;

-- Simple RPC: just look up the employee's auth email by org slug + employee code
create or replace function public.get_email_by_employee_code(
  p_slug text,
  p_employee_code text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  select p.email into v_email
  from employees e
  join profiles p on p.id = e.profile_id
  join organizations o on o.id = e.organization_id
  where o.slug = p_slug
    and e.employee_code = p_employee_code
    and e.status = 'active'
  limit 1;

  return v_email;
end;
$$;
