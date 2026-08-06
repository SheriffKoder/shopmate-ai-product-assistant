-- Secure append-only Client interactions and support deterministic timelines.
-- Reads follow the visible parent Client; manual inserts belong to auth.uid().
-- This migration changes only cre_client_interactions policies and indexes.

-- ---------------------------------------------------------------------------
-- Policies: parent-scoped reads + server-compatible manual inserts
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS cre_client_interactions_select_scoped
  ON public.cre_client_interactions;
DROP POLICY IF EXISTS cre_client_interactions_insert_scoped
  ON public.cre_client_interactions;
DROP POLICY IF EXISTS cre_client_interactions_update_scoped
  ON public.cre_client_interactions;
DROP POLICY IF EXISTS cre_client_interactions_delete_scoped
  ON public.cre_client_interactions;

CREATE POLICY cre_client_interactions_select_scoped
  ON public.cre_client_interactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.cre_clients client
      WHERE client.id = cre_client_interactions.client_id
        AND public.cre_can_access_agent(client.agent_id)
    )
  );

CREATE POLICY cre_client_interactions_insert_manual
  ON public.cre_client_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    agent_id = public.cre_current_agent_id()
    AND source = 'manual'
    AND EXISTS (
      SELECT 1
      FROM public.cre_clients client
      WHERE client.id = cre_client_interactions.client_id
        AND public.cre_can_access_agent(client.agent_id)
    )
  );

-- No UPDATE or DELETE policy is recreated. Phase 5 interaction history is
-- append-only for authenticated application users. Service-role maintenance
-- remains outside RLS and must be handled as an explicit administrative task.

-- ---------------------------------------------------------------------------
-- Index: parent filter + newest-first stable ordering
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_cre_client_interactions_timeline
  ON public.cre_client_interactions (client_id, created_at DESC, id DESC);

DROP INDEX IF EXISTS public.idx_cre_client_interactions_client_id;
