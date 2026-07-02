-- Get the organization ID for "EasyHR Demo"
-- Use this when signing up the first admin user
SELECT id, name, slug FROM public.organizations WHERE slug = 'easyhr-demo';
