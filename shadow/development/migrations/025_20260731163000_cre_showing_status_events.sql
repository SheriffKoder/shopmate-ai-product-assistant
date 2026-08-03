-- Durable Showing lifecycle history.
-- Schedule window updates do not create events unless status also changes.

CREATE TABLE public.cre_showing_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showing_id uuid NOT NULL REFERENCES public.cre_showings (id),
  agent_id uuid NOT NULL REFERENCES public.cre_agents (id),
  from_status public.cre_showing_status,
  to_status public.cre_showing_status NOT NULL,
  actor_id uuid REFERENCES public.cre_agents (id),
  actor_type public.cre_event_actor_type NOT NULL,
  source public.cre_event_source NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cre_showing_status_events_timeline
  ON public.cre_showing_status_events (showing_id, changed_at DESC, id DESC);

CREATE INDEX idx_cre_showing_status_events_scope_period
  ON public.cre_showing_status_events (agent_id, to_status, changed_at DESC);

ALTER TABLE public.cre_showing_status_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY cre_showing_status_events_select_scoped
  ON public.cre_showing_status_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.cre_showings showing
      WHERE showing.id = cre_showing_status_events.showing_id
        AND public.cre_can_access_agent(showing.agent_id)
    )
  );

CREATE OR REPLACE FUNCTION public.cre_capture_showing_status_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.cre_showing_status_events (
    showing_id,
    agent_id,
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

REVOKE ALL ON FUNCTION public.cre_capture_showing_status_event() FROM PUBLIC;

CREATE TRIGGER cre_showings_capture_status_event
AFTER INSERT OR UPDATE OF status
ON public.cre_showings
FOR EACH ROW
EXECUTE FUNCTION public.cre_capture_showing_status_event();

