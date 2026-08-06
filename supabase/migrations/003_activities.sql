-- MindFree activity tables (prefix: mf_)
-- App table names: shared/config/supabase-tables.ts
-- To drop the prefix: change TABLE_PREFIX there and rename objects below before first apply.

-- mf_task: activity definitions. kind = 'task' | 'reminder' (one shared model).
-- mf_task_record: completion records, one row per (task_id, date).

create table public.mf_task (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  kind           text not null check (kind in ('task', 'reminder')),
  title          text not null default '',
  description    text,
  color          text,
  tracking_mode  text not null check (
                   tracking_mode in ('boolean', 'count', 'duration', 'count+duration')
                 ),
  schedule_type  text not null check (
                   schedule_type in ('once', 'daily', 'weekly', 'monthly', 'yearly')
                 ),
  schedule_config jsonb,
  goal           integer check (goal is null or goal > 0),
  starts_at      date,
  ends_at        date,
  archived_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint mf_task_window_valid check (
    starts_at is null or ends_at is null or ends_at >= starts_at
  )
);

comment on table public.mf_task is 'Activity definitions: tasks and reminders share one model.';
comment on column public.mf_task.kind is 'task or reminder — decides page + presentation.';
comment on column public.mf_task.schedule_config is 'JSON per schedule_type: once=YYYY-MM-DD, daily=null, weekly/monthly/yearly=string[].';
comment on column public.mf_task.starts_at is 'Validity window start; NULL means open-ended.';
comment on column public.mf_task.ends_at is 'Validity window end; NULL means open-ended.';
comment on column public.mf_task.archived_at is 'Manual archive timestamp; NULL when active. Distinct from expiry.';

create table public.mf_task_record (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  task_id     uuid not null references public.mf_task (id) on delete cascade,
  date        date not null,
  count       integer not null default 0 check (count >= 0),
  duration    integer not null default 0 check (duration >= 0),
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- natural key: one aggregate record per activity per day
  constraint mf_task_record_task_date_unique unique (task_id, date)
);

comment on table public.mf_task_record is 'Daily completion records; one aggregate row per (task_id, date).';
comment on column public.mf_task_record.duration is 'Recorded duration in minutes.';

-- definitions read: by user + kind
create index mf_task_user_kind_idx
  on public.mf_task (user_id, kind);

-- records read: month scan by user + day
create index mf_task_record_user_date_idx
  on public.mf_task_record (user_id, date);

-- records cascade / per-activity lookups
create index mf_task_record_task_idx
  on public.mf_task_record (task_id);

create or replace function public.mf_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger mf_task_set_updated_at
  before update on public.mf_task
  for each row
  execute function public.mf_set_updated_at();

create trigger mf_task_record_set_updated_at
  before update on public.mf_task_record
  for each row
  execute function public.mf_set_updated_at();

alter table public.mf_task enable row level security;
alter table public.mf_task_record enable row level security;

create policy "mf_task_select_own"
  on public.mf_task
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "mf_task_insert_own"
  on public.mf_task
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "mf_task_update_own"
  on public.mf_task
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mf_task_delete_own"
  on public.mf_task
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "mf_task_record_select_own"
  on public.mf_task_record
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "mf_task_record_insert_own"
  on public.mf_task_record
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "mf_task_record_update_own"
  on public.mf_task_record
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mf_task_record_delete_own"
  on public.mf_task_record
  for delete
  to authenticated
  using (auth.uid() = user_id);
