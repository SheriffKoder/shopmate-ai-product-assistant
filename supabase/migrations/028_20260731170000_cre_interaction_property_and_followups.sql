-- Associate Client interactions with an optional visible Property.
-- Application validation proves visibility of both relations before insert.

ALTER TABLE public.cre_client_interactions
  ADD COLUMN property_id uuid REFERENCES public.cre_properties (id);

CREATE INDEX idx_cre_client_interactions_property_period
  ON public.cre_client_interactions (property_id, created_at DESC, id DESC)
  WHERE property_id IS NOT NULL;

DROP POLICY IF EXISTS cre_client_interactions_insert_manual
  ON public.cre_client_interactions;

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
    AND (
      property_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.cre_properties property
        WHERE property.id = cre_client_interactions.property_id
          AND public.cre_can_access_agent(property.agent_id)
      )
    )
  );
