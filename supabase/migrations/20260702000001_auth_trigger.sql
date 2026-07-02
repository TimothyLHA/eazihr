-- Run this in Supabase Dashboard SQL Editor
-- Management API cannot modify auth schema, so manual execution is required.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  v_org_id := (NEW.raw_user_meta_data->>'organization_id')::uuid;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'organization_id is required in user_metadata';
  END IF;

  INSERT INTO public.profiles (
    user_id,
    email,
    role,
    organization_id,
    full_name
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
    v_org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
