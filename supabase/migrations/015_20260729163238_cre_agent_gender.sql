-- Closer agent gender (additive only).
-- Nullable: male | female | NULL (unknown / unset).
-- Does not enable/change RLS. Does not touch non-cre_* objects.

CREATE TYPE public.cre_agent_gender AS ENUM ('male', 'female');

ALTER TABLE public.cre_agents
  ADD COLUMN IF NOT EXISTS gender public.cre_agent_gender;
