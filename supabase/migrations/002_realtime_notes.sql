-- Enable Supabase Realtime for notes (RLS still scopes events per user).

alter publication supabase_realtime add table public.mf_notes;
