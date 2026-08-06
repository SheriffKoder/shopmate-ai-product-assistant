-- MindFree payments table (prefix: mf_)
-- App table names: shared/config/supabase-tables.ts
-- Amount: numeric(12, 2) major currency units (not integer cents).

create table public.mf_payments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null default '',
  amount      numeric(12, 2) not null default 0 check (amount >= 0),
  description text not null default '',
  date        date not null,
  "group"     text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.mf_payments is 'User payment / expense rows scoped by payment date.';
comment on column public.mf_payments.amount is 'Major currency units with 2 decimal places (not cents).';
comment on column public.mf_payments.date is 'Payment date — drives month filter and week grouping.';
comment on column public.mf_payments."group" is 'Free-form group label; UI options live in shared/config/payment-groups.ts.';

-- Month reads by user + payment date
create index mf_payments_user_date_idx
  on public.mf_payments (user_id, date);

-- Within-month / list ordering by last update
create index mf_payments_user_updated_at_idx
  on public.mf_payments (user_id, updated_at desc);

-- Reuse shared updated_at trigger from 003_activities.sql
create trigger mf_payments_set_updated_at
  before update on public.mf_payments
  for each row
  execute function public.mf_set_updated_at();

alter table public.mf_payments enable row level security;

create policy "mf_payments_select_own"
  on public.mf_payments
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "mf_payments_insert_own"
  on public.mf_payments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "mf_payments_update_own"
  on public.mf_payments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mf_payments_delete_own"
  on public.mf_payments
  for delete
  to authenticated
  using (auth.uid() = user_id);
