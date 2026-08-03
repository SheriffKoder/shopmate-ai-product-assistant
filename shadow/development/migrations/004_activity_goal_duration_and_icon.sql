-- Add independent duration targets and reserve future activity icon metadata.

alter table public.mf_task
  add column goal_duration integer,
  add column icon text,
  add constraint mf_task_goal_duration_positive
    check (goal_duration is null or goal_duration > 0);

-- Before goal_duration existed, duration-only activities stored their minute
-- target in goal. Move that value so goal consistently means count.
update public.mf_task
set goal_duration = goal,
    goal = null
where tracking_mode = 'duration'
  and goal is not null;

comment on column public.mf_task.goal_duration is
  'Optional duration target in minutes.';

comment on column public.mf_task.icon is
  'Reserved semantic icon identifier; NULL until icon selection is implemented.';
