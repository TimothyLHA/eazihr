-- Add settings and feature_config columns to organizations if missing
alter table organizations
  add column if not exists settings jsonb default '{}'::jsonb,
  add column if not exists feature_config jsonb default '{}'::jsonb;

-- Update existing organizations to have defaults
update organizations
set settings = '{}'::jsonb
where settings is null;

update organizations
set feature_config = '{}'::jsonb
where feature_config is null;
