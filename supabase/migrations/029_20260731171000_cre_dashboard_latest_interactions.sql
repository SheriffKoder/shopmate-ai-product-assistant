-- Latest Client interaction projection for Dashboard operational attention.
-- Keeps append-only interaction histories at the database boundary.

CREATE OR REPLACE FUNCTION public.cre_dashboard_latest_client_interactions(
  p_agent_ids uuid[]
)
RETURNS TABLE (
  id uuid,
  client_id uuid,
  created_at timestamptz,
  next_follow_up_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT ON (interaction.client_id)
    interaction.id,
    interaction.client_id,
    interaction.created_at,
    interaction.next_follow_up_at
  FROM public.cre_client_interactions AS interaction
  WHERE interaction.agent_id = ANY (p_agent_ids)
    AND public.cre_can_access_agent(interaction.agent_id)
  ORDER BY
    interaction.client_id,
    interaction.created_at DESC,
    interaction.id DESC;
$$;

REVOKE ALL
  ON FUNCTION public.cre_dashboard_latest_client_interactions(uuid[])
  FROM PUBLIC;

GRANT EXECUTE
  ON FUNCTION public.cre_dashboard_latest_client_interactions(uuid[])
  TO authenticated;
