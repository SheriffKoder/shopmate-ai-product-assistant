-- MindFree notes table (prefix: mf_)
-- App table names: shared/config/supabase-tables.ts
-- To drop the prefix: change TABLE_PREFIX there and rename objects below before first apply.

-- Calendar notes: date IS NOT NULL (one per user per day)
-- General notes: date IS NULL AND is_quick = false
-- Quick note: date IS NULL AND is_quick = true (one per user)

create table public.mf_notes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  date           date,
  title          text not null default '',
  content        text not null default '',
  starred        boolean not null default false,
  is_important   boolean not null default false,
  is_quick       boolean not null default false,
  last_edited_at timestamptz not null default now(),
  created_at     timestamptz not null default now(),

  constraint mf_notes_quick_requires_null_date check (
    not (is_quick and date is not null)
  )
);

comment on table public.mf_notes is 'User notes: calendar (dated), general, or quick.';
comment on column public.mf_notes.date is 'NULL for general and quick notes.';
comment on column public.mf_notes.is_quick is 'True for the single Home quick-note slot per user.';
comment on column public.mf_notes.is_important is 'Calendar cell dark-red border when true.';

-- one calendar note per user per day
create unique index mf_notes_user_date_unique
  on public.mf_notes (user_id, date)
  where date is not null;

-- one quick note per user
create unique index mf_notes_user_quick_unique
  on public.mf_notes (user_id)
  where is_quick = true;

create index mf_notes_user_month_idx
  on public.mf_notes (user_id, date)
  where date is not null;

create index mf_notes_user_general_idx
  on public.mf_notes (user_id)
  where date is null and is_quick = false;

create index mf_notes_user_starred_idx
  on public.mf_notes (user_id, starred)
  where starred = true;

create or replace function public.mf_set_notes_last_edited_at()
returns trigger
language plpgsql
as $$
begin
  new.last_edited_at = now();
  return new;
end;
$$;

create trigger mf_notes_set_last_edited_at
  before update on public.mf_notes
  for each row
  execute function public.mf_set_notes_last_edited_at();

alter table public.mf_notes enable row level security;

create policy "mf_notes_select_own"
  on public.mf_notes
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "mf_notes_insert_own"
  on public.mf_notes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "mf_notes_update_own"
  on public.mf_notes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mf_notes_delete_own"
  on public.mf_notes
  for delete
  to authenticated
  using (auth.uid() = user_id);
