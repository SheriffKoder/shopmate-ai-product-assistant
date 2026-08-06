-- Enable Supabase Realtime for payments (RLS still scopes events per user).
-- REPLICA IDENTITY FULL so DELETE payloads can carry non-PK columns when needed;
-- client hooks still subscribe to DELETE unfiltered and apply only warm cache hits.

alter publication supabase_realtime add table public.mf_payments;

alter table public.mf_payments replica identity full;
