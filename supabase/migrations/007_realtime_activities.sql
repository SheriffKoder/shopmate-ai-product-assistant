-- Enable Supabase Realtime for activities (RLS still scopes events per user).

alter publication supabase_realtime add table public.mf_task;
alter publication supabase_realtime add table public.mf_task_record;
