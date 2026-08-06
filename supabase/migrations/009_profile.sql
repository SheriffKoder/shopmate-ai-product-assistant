-- MindFree profile tables (prefix: mf_)
-- App table names: shared/config/supabase-tables.ts (Step 2)
-- Defaults here must stay in sync with entities/profile/lib/default-profile-values.ts

-- mf_profiles: app identity (1:1 with auth.users)
-- mf_user_preferences: theme + export settings
-- mf_user_security_settings: app lock (hash only; never plaintext)

create table public.mf_profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  email        text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.mf_profiles is 'App identity per user; auth.users remains auth source of truth.';
comment on column public.mf_profiles.email is 'Mirror of auth email for convenient reads; auth.users.email is authoritative.';

create table public.mf_user_preferences (
  user_id                    uuid primary key references auth.users (id) on delete cascade,
  theme_mode                 text not null default 'dark'
                               check (theme_mode in ('light', 'dark', 'custom')),
  background_color           text,
  background_image_url       text,
  drawer_background_color    text,
  drawer_background_opacity  numeric(4, 3)
                               check (
                                 drawer_background_opacity is null
                                 or (
                                   drawer_background_opacity >= 0
                                   and drawer_background_opacity <= 1
                                 )
                               ),
  text_contrast_mode         text not null default 'dark'
                               check (text_contrast_mode in ('light', 'dark')),
  accent_color               text,
  export_email               text not null default '',
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

comment on table public.mf_user_preferences is 'Theme, custom surface tokens, accent, and export email.';
comment on column public.mf_user_preferences.accent_color is 'Nullable CSS color; applies in light, dark, and custom. NULL = palette default.';
comment on column public.mf_user_preferences.text_contrast_mode is 'next-themes base when theme_mode is custom.';

create table public.mf_user_security_settings (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  app_lock_enabled   boolean not null default false,
  app_password_hash  text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.mf_user_security_settings is 'App-level lock screen; separate from Supabase Auth password.';
comment on column public.mf_user_security_settings.app_password_hash is 'Hash only — never store plaintext.';

-- Reuse mf_set_updated_at from 003_activities.sql
create trigger mf_profiles_set_updated_at
  before update on public.mf_profiles
  for each row
  execute function public.mf_set_updated_at();

create trigger mf_user_preferences_set_updated_at
  before update on public.mf_user_preferences
  for each row
  execute function public.mf_set_updated_at();

create trigger mf_user_security_settings_set_updated_at
  before update on public.mf_user_security_settings
  for each row
  execute function public.mf_set_updated_at();

alter table public.mf_profiles enable row level security;
alter table public.mf_user_preferences enable row level security;
alter table public.mf_user_security_settings enable row level security;

-- profiles: own row keyed by id = auth.uid()
create policy "mf_profiles_select_own"
  on public.mf_profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "mf_profiles_insert_own"
  on public.mf_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "mf_profiles_update_own"
  on public.mf_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "mf_profiles_delete_own"
  on public.mf_profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- preferences / security: own row keyed by user_id = auth.uid()
create policy "mf_user_preferences_select_own"
  on public.mf_user_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "mf_user_preferences_insert_own"
  on public.mf_user_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "mf_user_preferences_update_own"
  on public.mf_user_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mf_user_preferences_delete_own"
  on public.mf_user_preferences
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "mf_user_security_settings_select_own"
  on public.mf_user_security_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "mf_user_security_settings_insert_own"
  on public.mf_user_security_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "mf_user_security_settings_update_own"
  on public.mf_user_security_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mf_user_security_settings_delete_own"
  on public.mf_user_security_settings
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Signup seed (A): insert default rows when a new auth user is created.
-- security definer so the trigger can write public tables under RLS.
create or replace function public.mf_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seed_email text := coalesce(new.email, '');
begin
  insert into public.mf_profiles (id, display_name, email)
  values (new.id, '', seed_email)
  on conflict (id) do nothing;

  insert into public.mf_user_preferences (
    user_id,
    theme_mode,
    background_color,
    background_image_url,
    drawer_background_color,
    drawer_background_opacity,
    text_contrast_mode,
    accent_color,
    export_email
  )
  values (
    new.id,
    'dark',
    null,
    null,
    null,
    null,
    'dark',
    null,
    seed_email
  )
  on conflict (user_id) do nothing;

  insert into public.mf_user_security_settings (
    user_id,
    app_lock_enabled,
    app_password_hash
  )
  values (new.id, false, null)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

comment on function public.mf_handle_new_user() is
  'After auth.users insert: seed mf_profiles, mf_user_preferences, mf_user_security_settings.';

create trigger mf_on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.mf_handle_new_user();

-- Backfill existing auth users (idempotent)
insert into public.mf_profiles (id, display_name, email)
select
  u.id,
  '',
  coalesce(u.email, '')
from auth.users u
on conflict (id) do nothing;

insert into public.mf_user_preferences (
  user_id,
  theme_mode,
  background_color,
  background_image_url,
  drawer_background_color,
  drawer_background_opacity,
  text_contrast_mode,
  accent_color,
  export_email
)
select
  u.id,
  'dark',
  null,
  null,
  null,
  null,
  'dark',
  null,
  coalesce(u.email, '')
from auth.users u
on conflict (user_id) do nothing;

insert into public.mf_user_security_settings (
  user_id,
  app_lock_enabled,
  app_password_hash
)
select
  u.id,
  false,
  null
from auth.users u
on conflict (user_id) do nothing;
