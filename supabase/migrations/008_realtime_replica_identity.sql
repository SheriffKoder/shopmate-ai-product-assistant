-- Realtime DELETE payloads only include columns covered by replica identity.
-- Default identity is PK-only, so `user_id` filters cannot match DELETE events.
-- FULL ensures `old` can carry non-PK columns when Realtime/RLS allow it.
-- Client hooks still subscribe to DELETE without a user_id filter and apply only
-- when the row is already present in the local TanStack cache (see realtime docs).

alter table public.mf_notes replica identity full;
alter table public.mf_task replica identity full;
alter table public.mf_task_record replica identity full;
