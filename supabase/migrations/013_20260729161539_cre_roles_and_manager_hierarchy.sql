-- Closer roles + manager hierarchy (additive only).
-- Extends cre_agent_role with 'manager' and adds cre_agents.manager_id.
-- Does not enable RLS (see initial-setup-rls step 3).
-- Does not DROP/TRUNCATE/ALTER any non-cre_* objects.

-- ---------------------------------------------------------------------------
-- Enum: admin | agent | manager
-- ---------------------------------------------------------------------------

ALTER TYPE public.cre_agent_role ADD VALUE IF NOT EXISTS 'manager';

-- ---------------------------------------------------------------------------
-- Hierarchy: agent reports to manager (nullable)
-- ---------------------------------------------------------------------------

ALTER TABLE public.cre_agents
  ADD COLUMN IF NOT EXISTS manager_id uuid
    REFERENCES public.cre_agents (id);

CREATE INDEX IF NOT EXISTS idx_cre_agents_manager_id
  ON public.cre_agents (manager_id)
  WHERE manager_id IS NOT NULL;
