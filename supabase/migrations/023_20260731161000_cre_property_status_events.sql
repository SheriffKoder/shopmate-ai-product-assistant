-- Durable Property status history for dashboard metrics and timelines.
-- Event rows are trigger-owned and append-only to authenticated users.

CREATE TABLE public.cre_property_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.cre_properties (id),
  agent_id uuid NOT NULL REFERENCES public.cre_agents (id),
  property_type public.cre_property_type NOT NULL,
  from_status public.cre_property_status,
  to_status public.cre_property_status NOT NULL,
  actor_id uuid REFERENCES public.cre_agents (id),
  actor_type public.cre_event_actor_type NOT NULL,
  source public.cre_event_source NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cre_property_status_events_timeline
  ON public.cre_property_status_events (property_id, changed_at DESC, id DESC);

CREATE INDEX idx_cre_property_status_events_scope_period
  ON public.cre_property_status_events (
    agent_id,
    to_status,
    changed_at DESC
  );

ALTER TABLE public.cre_property_status_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY cre_property_status_events_select_scoped
  ON public.cre_property_status_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.cre_properties property
      WHERE property.id = cre_property_status_events.property_id
        AND public.cre_can_access_agent(property.agent_id)
    )
  );

CREATE OR REPLACE FUNCTION public.cre_capture_property_status_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.cre_property_status_events (
    property_id,
    agent_id,
    property_type,
    from_status,
    to_status,
    actor_id,
    actor_type,
    source,
    changed_at
  )
  VALUES (
    NEW.id,
    NEW.agent_id,
    NEW.property_type,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
    NEW.status,
    public.cre_event_actor_id(),
    public.cre_event_actor_type(),
    public.cre_event_source(),
    now()
  );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.cre_capture_property_status_event() FROM PUBLIC;

CREATE TRIGGER cre_properties_capture_status_event
AFTER INSERT OR UPDATE OF status
ON public.cre_properties
FOR EACH ROW
EXECUTE FUNCTION public.cre_capture_property_status_event();

