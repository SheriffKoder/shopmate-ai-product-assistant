-- Durable Client stage history for conversion metrics and future timelines.
-- Event rows are trigger-owned and append-only to authenticated users.

CREATE TABLE public.cre_client_stage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.cre_clients (id),
  agent_id uuid NOT NULL REFERENCES public.cre_agents (id),
  from_stage public.cre_client_stage,
  to_stage public.cre_client_stage NOT NULL,
  actor_id uuid REFERENCES public.cre_agents (id),
  actor_type public.cre_event_actor_type NOT NULL,
  source public.cre_event_source NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cre_client_stage_events_timeline
  ON public.cre_client_stage_events (client_id, changed_at DESC, id DESC);

CREATE INDEX idx_cre_client_stage_events_scope_period
  ON public.cre_client_stage_events (agent_id, to_stage, changed_at DESC);

ALTER TABLE public.cre_client_stage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY cre_client_stage_events_select_scoped
  ON public.cre_client_stage_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.cre_clients client
      WHERE client.id = cre_client_stage_events.client_id
        AND public.cre_can_access_agent(client.agent_id)
    )
  );

CREATE OR REPLACE FUNCTION public.cre_capture_client_stage_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.stage IS NOT DISTINCT FROM NEW.stage THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.cre_client_stage_events (
    client_id,
    agent_id,
    from_stage,
    to_stage,
    actor_id,
    actor_type,
    source,
    changed_at
  )
  VALUES (
    NEW.id,
    NEW.agent_id,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.stage END,
    NEW.stage,
    public.cre_event_actor_id(),
    public.cre_event_actor_type(),
    public.cre_event_source(),
    now()
  );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.cre_capture_client_stage_event() FROM PUBLIC;

CREATE TRIGGER cre_clients_capture_stage_event
AFTER INSERT OR UPDATE OF stage
ON public.cre_clients
FOR EACH ROW
EXECUTE FUNCTION public.cre_capture_client_stage_event();

