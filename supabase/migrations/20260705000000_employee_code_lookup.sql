-- RPC functions for employee app login with Employee ID (number only)
-- Run this in Supabase Dashboard SQL Editor

-- Look up organization ID by slug
create or replace function public.get_org_id_by_slug(p_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  select id into v_org_id
  from organizations
  where slug = p_slug
  limit 1;

  return v_org_id;
end;
$$;

-- Look up email by employee_code within an organization
create or replace function public.get_email_by_employee_code(
  p_org_id uuid,
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
  where e.organization_id = p_org_id
    and e.employee_code = p_employee_code
    and e.status = 'active'
  limit 1;

  return v_email;
end;
$$;
