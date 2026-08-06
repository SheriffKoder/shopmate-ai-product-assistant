-- Monthly AI ad-generation quota on cre_agents (typed columns, not JSON).
-- Additive only. Does not enable/change unrelated RLS policies.
--
-- Defaults: 15 requests / calendar month (UTC YYYY-MM).
-- Consumption is atomic via cre_consume_agent_ai_quota (SECURITY DEFINER)
-- because cre_agents UPDATE remains admin-only under RLS.

ALTER TABLE public.cre_agents
  ADD COLUMN IF NOT EXISTS ai_monthly_limit integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS ai_requests_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_usage_month text NOT NULL DEFAULT '';

ALTER TABLE public.cre_agents
  DROP CONSTRAINT IF EXISTS cre_agents_ai_monthly_limit_nonneg;

ALTER TABLE public.cre_agents
  ADD CONSTRAINT cre_agents_ai_monthly_limit_nonneg
  CHECK (ai_monthly_limit >= 0);

ALTER TABLE public.cre_agents
  DROP CONSTRAINT IF EXISTS cre_agents_ai_requests_used_nonneg;

ALTER TABLE public.cre_agents
  ADD CONSTRAINT cre_agents_ai_requests_used_nonneg
  CHECK (ai_requests_used >= 0);

COMMENT ON COLUMN public.cre_agents.ai_monthly_limit IS
  'Max AI generate-ad requests allowed per calendar month (admin editable).';

COMMENT ON COLUMN public.cre_agents.ai_requests_used IS
  'AI generate-ad requests consumed in ai_usage_month (system managed).';

COMMENT ON COLUMN public.cre_agents.ai_usage_month IS
  'UTC calendar month key YYYY-MM for ai_requests_used; empty until first consume.';

-- Atomically roll the month (if needed) and consume one request when under limit.
-- Caller may only consume for self unless admin. Returns allowed=false when exhausted.
CREATE OR REPLACE FUNCTION public.cre_consume_agent_ai_quota(
  p_agent_id uuid DEFAULT NULL
)
RETURNS TABLE (
  allowed boolean,
  ai_monthly_limit integer,
  ai_requests_used integer,
  ai_usage_month text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_id uuid := COALESCE(p_agent_id, auth.uid());
  v_period text := to_char((timezone('utc', now())), 'YYYY-MM');
  v_limit integer;
  v_used integer;
  v_month text;
BEGIN
  IF v_agent_id IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  IF NOT public.cre_is_closer_agent() THEN
    RAISE EXCEPTION 'not a closer agent';
  END IF;

  IF v_agent_id IS DISTINCT FROM auth.uid() AND NOT public.cre_is_admin() THEN
    RAISE EXCEPTION 'not allowed to consume quota for another agent';
  END IF;

  SELECT a.ai_monthly_limit, a.ai_requests_used, a.ai_usage_month
  INTO v_limit, v_used, v_month
  FROM public.cre_agents a
  WHERE a.id = v_agent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'agent not found';
  END IF;

  IF v_month IS DISTINCT FROM v_period THEN
    v_used := 0;
    v_month := v_period;
  END IF;

  IF v_used >= v_limit THEN
    UPDATE public.cre_agents a
    SET
      ai_requests_used = v_used,
      ai_usage_month = v_month
    WHERE a.id = v_agent_id
      AND (
        a.ai_usage_month IS DISTINCT FROM v_month
        OR a.ai_requests_used IS DISTINCT FROM v_used
      );

    RETURN QUERY SELECT false, v_limit, v_used, v_month;
    RETURN;
  END IF;

  v_used := v_used + 1;

  UPDATE public.cre_agents a
  SET
    ai_requests_used = v_used,
    ai_usage_month = v_month
  WHERE a.id = v_agent_id;

  RETURN QUERY SELECT true, v_limit, v_used, v_month;
END;
$$;

REVOKE ALL ON FUNCTION public.cre_consume_agent_ai_quota(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cre_consume_agent_ai_quota(uuid) TO authenticated;
