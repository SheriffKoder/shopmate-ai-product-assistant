-- Add optional period-shaped Progress goals and task priority.

alter table public.mf_task
  add column goal_period text,
  add column period_goal integer,
  add column period_goal_duration integer,
  add column priority text,
  add constraint mf_task_goal_period_valid
    check (goal_period is null or goal_period in ('week', 'month')),
  add constraint mf_task_period_goal_positive
    check (period_goal is null or period_goal > 0),
  add constraint mf_task_period_goal_duration_positive
    check (period_goal_duration is null or period_goal_duration > 0),
  add constraint mf_task_priority_valid
    check (priority is null or priority in ('low', 'medium', 'high'));

comment on column public.mf_task.goal_period is
  'Optional period unit ("week" or "month") for period-shaped Progress goals; NULL means the task uses the due-day goal model only.';

comment on column public.mf_task.period_goal is
  'Optional count-shaped target for the chosen goal_period (also used by boolean tasks as a completions-per-period target).';

comment on column public.mf_task.period_goal_duration is
  'Optional duration-shaped target in minutes for the chosen goal_period.';

comment on column public.mf_task.priority is
  'Optional priority ("low" | "medium" | "high"); NULL means unset. Not yet consumed outside the editor.';
