-- Per-day tracking configuration on activity records.
-- The record form submits these columns on every upsert (seeded from the task
-- on first create; goals remain editable afterward).
-- Precondition: no records exist; historical configuration cannot be inferred.

do $$
begin
  if exists (select 1 from public.mf_task_record limit 1) then
    raise exception
      'Migration 005 requires an empty mf_task_record table; existing record snapshots cannot be inferred.';
  end if;
end;
$$;

alter table public.mf_task_record
  add column tracking_mode_snapshot text not null,
  add column goal_snapshot integer,
  add column goal_duration_snapshot integer,
  add constraint mf_task_record_tracking_mode_snapshot_valid check (
    tracking_mode_snapshot in ('boolean', 'count', 'duration', 'count+duration')
  ),
  add constraint mf_task_record_goal_snapshot_valid check (
    goal_snapshot is null or goal_snapshot > 0
  ),
  add constraint mf_task_record_goal_duration_snapshot_valid check (
    goal_duration_snapshot is null or goal_duration_snapshot > 0
  );

comment on column public.mf_task_record.tracking_mode_snapshot is
  'Tracking mode submitted by the record form when this daily record is saved.';
comment on column public.mf_task_record.goal_snapshot is
  'Editable per-day count goal submitted by the record form.';
comment on column public.mf_task_record.goal_duration_snapshot is
  'Editable per-day duration goal in minutes submitted by the record form.';
