-- Closer RLS helpers + policies (additive only).
-- Implements initial-setup-rls step 3.
-- Does not DROP/TRUNCATE/ALTER any non-cre_* objects.
--
-- Identity: auth.uid() = cre_agents.id
-- Roles: admin (all), manager (self + reportees), agent (self)
-- Config SELECT requires a cre_agents row (shared-project Auth users excluded).

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER — avoid cre_agents RLS recursion)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.cre_current_agent_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id
  FROM public.cre_agents a
  WHERE a.id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.cre_current_role()
RETURNS public.cre_agent_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.role
  FROM public.cre_agents a
  WHERE a.id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.cre_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cre_agents a
    WHERE a.id = auth.uid()
      AND a.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.cre_is_closer_agent()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cre_agents a
    WHERE a.id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.cre_can_access_agent(target_agent_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.cre_is_admin()
    OR target_agent_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.cre_agents a
      WHERE a.id = target_agent_id
        AND a.manager_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.cre_current_agent_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cre_current_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cre_is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cre_is_closer_agent() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cre_can_access_agent(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.cre_current_agent_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cre_current_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cre_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cre_is_closer_agent() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cre_can_access_agent(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.cre_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cre_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cre_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cre_client_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cre_activity_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cre_team_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cre_ad_prompt_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cre_showings ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- cre_agents — SELECT scoped; writes admin-only
-- ---------------------------------------------------------------------------

CREATE POLICY cre_agents_select_scoped
  ON public.cre_agents
  FOR SELECT
  TO authenticated
  USING (public.cre_can_access_agent(id));

CREATE POLICY cre_agents_insert_admin
  ON public.cre_agents
  FOR INSERT
  TO authenticated
  WITH CHECK (public.cre_is_admin());

CREATE POLICY cre_agents_update_admin
  ON public.cre_agents
  FOR UPDATE
  TO authenticated
  USING (public.cre_is_admin())
  WITH CHECK (public.cre_is_admin());

CREATE POLICY cre_agents_delete_admin
  ON public.cre_agents
  FOR DELETE
  TO authenticated
  USING (public.cre_is_admin());

-- ---------------------------------------------------------------------------
-- Business tables — scope via agent_id
-- ---------------------------------------------------------------------------

-- cre_properties
CREATE POLICY cre_properties_select_scoped
  ON public.cre_properties
  FOR SELECT
  TO authenticated
  USING (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_properties_insert_scoped
  ON public.cre_properties
  FOR INSERT
  TO authenticated
  WITH CHECK (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_properties_update_scoped
  ON public.cre_properties
  FOR UPDATE
  TO authenticated
  USING (public.cre_can_access_agent(agent_id))
  WITH CHECK (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_properties_delete_scoped
  ON public.cre_properties
  FOR DELETE
  TO authenticated
  USING (public.cre_can_access_agent(agent_id));

-- cre_clients
CREATE POLICY cre_clients_select_scoped
  ON public.cre_clients
  FOR SELECT
  TO authenticated
  USING (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_clients_insert_scoped
  ON public.cre_clients
  FOR INSERT
  TO authenticated
  WITH CHECK (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_clients_update_scoped
  ON public.cre_clients
  FOR UPDATE
  TO authenticated
  USING (public.cre_can_access_agent(agent_id))
  WITH CHECK (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_clients_delete_scoped
  ON public.cre_clients
  FOR DELETE
  TO authenticated
  USING (public.cre_can_access_agent(agent_id));

-- cre_client_interactions
CREATE POLICY cre_client_interactions_select_scoped
  ON public.cre_client_interactions
  FOR SELECT
  TO authenticated
  USING (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_client_interactions_insert_scoped
  ON public.cre_client_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_client_interactions_update_scoped
  ON public.cre_client_interactions
  FOR UPDATE
  TO authenticated
  USING (public.cre_can_access_agent(agent_id))
  WITH CHECK (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_client_interactions_delete_scoped
  ON public.cre_client_interactions
  FOR DELETE
  TO authenticated
  USING (public.cre_can_access_agent(agent_id));

-- cre_activity_segments
CREATE POLICY cre_activity_segments_select_scoped
  ON public.cre_activity_segments
  FOR SELECT
  TO authenticated
  USING (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_activity_segments_insert_scoped
  ON public.cre_activity_segments
  FOR INSERT
  TO authenticated
  WITH CHECK (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_activity_segments_update_scoped
  ON public.cre_activity_segments
  FOR UPDATE
  TO authenticated
  USING (public.cre_can_access_agent(agent_id))
  WITH CHECK (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_activity_segments_delete_scoped
  ON public.cre_activity_segments
  FOR DELETE
  TO authenticated
  USING (public.cre_can_access_agent(agent_id));

-- cre_showings
CREATE POLICY cre_showings_select_scoped
  ON public.cre_showings
  FOR SELECT
  TO authenticated
  USING (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_showings_insert_scoped
  ON public.cre_showings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_showings_update_scoped
  ON public.cre_showings
  FOR UPDATE
  TO authenticated
  USING (public.cre_can_access_agent(agent_id))
  WITH CHECK (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_showings_delete_scoped
  ON public.cre_showings
  FOR DELETE
  TO authenticated
  USING (public.cre_can_access_agent(agent_id));

-- ---------------------------------------------------------------------------
-- Config — Closer agents read; admin writes
-- ---------------------------------------------------------------------------

CREATE POLICY cre_team_targets_select_closer
  ON public.cre_team_targets
  FOR SELECT
  TO authenticated
  USING (public.cre_is_closer_agent());

CREATE POLICY cre_team_targets_insert_admin
  ON public.cre_team_targets
  FOR INSERT
  TO authenticated
  WITH CHECK (public.cre_is_admin());

CREATE POLICY cre_team_targets_update_admin
  ON public.cre_team_targets
  FOR UPDATE
  TO authenticated
  USING (public.cre_is_admin())
  WITH CHECK (public.cre_is_admin());

CREATE POLICY cre_team_targets_delete_admin
  ON public.cre_team_targets
  FOR DELETE
  TO authenticated
  USING (public.cre_is_admin());

CREATE POLICY cre_ad_prompt_config_select_closer
  ON public.cre_ad_prompt_config
  FOR SELECT
  TO authenticated
  USING (public.cre_is_closer_agent());

CREATE POLICY cre_ad_prompt_config_insert_admin
  ON public.cre_ad_prompt_config
  FOR INSERT
  TO authenticated
  WITH CHECK (public.cre_is_admin());

CREATE POLICY cre_ad_prompt_config_update_admin
  ON public.cre_ad_prompt_config
  FOR UPDATE
  TO authenticated
  USING (public.cre_is_admin())
  WITH CHECK (public.cre_is_admin());

CREATE POLICY cre_ad_prompt_config_delete_admin
  ON public.cre_ad_prompt_config
  FOR DELETE
  TO authenticated
  USING (public.cre_is_admin());
