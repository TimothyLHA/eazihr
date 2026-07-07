-- ============================================================
-- Seed: Demo Employee with Password
-- ============================================================
-- Prerequisites:
--   1. Run all migrations first
--   2. Run the auth trigger (20260702000001_auth_trigger.sql) 
--      in Supabase SQL Editor
--   3. Create an auth user via Supabase Dashboard:
--      - Email: admin@easyhr.com
--      - Password: password123
--      - Email confirm: ON
--      - User Metadata: {"organization_id": "<org-id>", "role": "employee"}
-- ============================================================

-- Step 1: Create or get the organization
insert into public.organizations (name, slug)
values ('EasyHR Demo', 'easyhr-demo')
on conflict (slug) do nothing;

-- Step 2: Get the org ID (replace with your actual UUID if different)
select id as org_id from public.organizations where slug = 'easyhr-demo';

-- Step 3: After creating the auth user in Dashboard,
--         get the profile_id that was auto-created by the trigger
-- select id as profile_id from public.profiles where email = 'admin@easyhr.com';

-- Step 4: Insert the employee with hashed password
--         REPLACE the UUIDs with your actual values
-- insert into public.employees (
--   profile_id,
--   organization_id,
--   employee_code,
--   position,
--   department,
--   hire_date,
--   basic_salary,
--   status,
--   password_hash
-- ) values (
--   '<profile-uuid>',         -- from step 3
--   '<org-uuid>',             -- from step 2
--   '001',
--   'Admin Manager',
--   'Operations',
--   '2026-07-01',
--   1000000.00,
--   'active',
--   crypt('password123', gen_salt('bf'))
-- );
