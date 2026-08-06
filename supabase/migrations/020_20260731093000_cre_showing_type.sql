-- Closer showing type (additive only).
-- Separates property-cycle event kind from lifecycle status (scheduled/completed/cancelled).
-- Does not enable/change RLS. Does not touch non-cre_* objects.

CREATE TYPE public.cre_showing_type AS ENUM (
  'screening',
  'showing',
  'meeting',
  'follow_up'
);

-- Existing rows (if any) backfill to 'showing' via DEFAULT before NOT NULL is enforced.
ALTER TABLE public.cre_showings
  ADD COLUMN IF NOT EXISTS type public.cre_showing_type NOT NULL DEFAULT 'showing';

COMMENT ON COLUMN public.cre_showings.type IS
  'Property-cycle event kind (screening | showing | meeting | follow_up). Distinct from status.';
