-- Persist every admitted Property ad-generation attempt and its final result.

CREATE TYPE public.cre_ad_generation_status AS ENUM (
  'pending',
  'succeeded',
  'failed'
);

CREATE TABLE public.cre_property_ad_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.cre_properties (id),
  agent_id uuid NOT NULL REFERENCES public.cre_agents (id),
  requested_by uuid NOT NULL REFERENCES public.cre_agents (id),
  prompt_config_id uuid REFERENCES public.cre_ad_prompt_config (id),
  language text NOT NULL,
  status public.cre_ad_generation_status NOT NULL DEFAULT 'pending',
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT cre_property_ad_generations_language
    CHECK (language IN ('en', 'ar', 'es')),
  CONSTRAINT cre_property_ad_generations_final_state
    CHECK (
      (status = 'pending' AND completed_at IS NULL AND failure_reason IS NULL)
      OR (status = 'succeeded' AND completed_at IS NOT NULL
        AND failure_reason IS NULL)
      OR (status = 'failed' AND completed_at IS NOT NULL)
    )
);

CREATE INDEX idx_cre_property_ad_generations_scope_period
  ON public.cre_property_ad_generations (
    agent_id,
    status,
    created_at DESC
  );

CREATE INDEX idx_cre_property_ad_generations_property_period
  ON public.cre_property_ad_generations (property_id, created_at DESC);

ALTER TABLE public.cre_property_ad_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY cre_property_ad_generations_select_scoped
  ON public.cre_property_ad_generations
  FOR SELECT
  TO authenticated
  USING (public.cre_can_access_agent(agent_id));

CREATE POLICY cre_property_ad_generations_insert_requester
  ON public.cre_property_ad_generations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    requested_by = public.cre_current_agent_id()
    AND status = 'pending'
    AND completed_at IS NULL
    AND failure_reason IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.cre_properties property
      WHERE property.id = property_id
        AND property.agent_id = agent_id
        AND public.cre_can_access_agent(property.agent_id)
    )
  );

CREATE POLICY cre_property_ad_generations_update_requester
  ON public.cre_property_ad_generations
  FOR UPDATE
  TO authenticated
  USING (
    requested_by = public.cre_current_agent_id()
    AND status = 'pending'
  )
  WITH CHECK (
    requested_by = public.cre_current_agent_id()
    AND status IN ('succeeded', 'failed')
    AND completed_at IS NOT NULL
  );

-- Finalization may change outcome fields only; attribution remains immutable.
CREATE OR REPLACE FUNCTION public.cre_guard_ad_generation_finalization()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status <> 'pending' OR NEW.status = 'pending' THEN
    RAISE EXCEPTION 'ad generation may only transition pending to final';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.property_id IS DISTINCT FROM OLD.property_id
    OR NEW.agent_id IS DISTINCT FROM OLD.agent_id
    OR NEW.requested_by IS DISTINCT FROM OLD.requested_by
    OR NEW.prompt_config_id IS DISTINCT FROM OLD.prompt_config_id
    OR NEW.language IS DISTINCT FROM OLD.language
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'ad generation attribution is immutable';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.cre_guard_ad_generation_finalization()
  FROM PUBLIC;

CREATE TRIGGER cre_property_ad_generations_guard_finalization
BEFORE UPDATE
ON public.cre_property_ad_generations
FOR EACH ROW
EXECUTE FUNCTION public.cre_guard_ad_generation_finalization();
