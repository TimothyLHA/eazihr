-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto;

-- Add password_hash column to employees
alter table public.employees add column password_hash text;

-- Combined sign-in RPC: verifies org slug + employee code + password
-- Returns the auth email on success, null on failure
create or replace function public.sign_in_employee(
  p_slug text,
  p_employee_code text,
  p_password text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_hash text;
begin
  select p.email, e.password_hash into v_email, v_hash
  from employees e
  join profiles p on p.id = e.profile_id
  join organizations o on o.id = e.organization_id
  where o.slug = p_slug
    and e.employee_code = p_employee_code
    and e.status = 'active'
  limit 1;

  if v_email is null or v_hash is null then
    return null;
  end if;

  if v_hash = crypt(p_password, v_hash) then
    return v_email;
  end if;

  return null;
end;
$$;
