-- Shared audit vocabulary for Closer append-only event tables.
-- Additive only. Event tables and their triggers are introduced separately.
--
-- Trigger convention:
-- 1. agent_id is the immutable owner of the measured work.
-- 2. actor_id identifies the trusted agent who caused the change, when known.
-- 3. actor_type is user when actor_id resolves, otherwise system.
-- 4. source describes the trusted write path, not the event's business domain.
--
-- PostgreSQL transaction-local settings are used because a trigger cannot
-- infer whether an authenticated write came from UI, API, AI, or automation.
-- A future SECURITY DEFINER mutation RPC may set these values before writing:
--
--   SELECT set_config('cre.audit.actor_id', '<agent uuid>', true);
--   SELECT set_config('cre.audit.source', 'ui', true);
--
-- Ordinary PostgREST mutations do not share a transaction with a preceding
-- RPC call. They therefore resolve safely to System/database instead of
-- claiming an actor or application source that the trigger cannot verify.

CREATE TYPE public.cre_event_actor_type AS ENUM ('user', 'system');

CREATE TYPE public.cre_event_source AS ENUM (
  'ui',
  'api',
  'ai',
  'automation',
  'database'
);

COMMENT ON TYPE public.cre_event_actor_type IS
  'Whether a Closer event was caused by a trusted user context or by System.';

COMMENT ON TYPE public.cre_event_source IS
  'Trusted write path for Closer events; database is the safe fallback.';

-- Resolve a transaction-local actor only when it maps to a Closer agent.
CREATE OR REPLACE FUNCTION public.cre_event_actor_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_setting text := NULLIF(
    current_setting('cre.audit.actor_id', true),
    ''
  );
  v_actor_id uuid;
BEGIN
  IF v_actor_setting IS NULL THEN
    RETURN NULL;
  END IF;

  BEGIN
    v_actor_id := v_actor_setting::uuid;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN NULL;
  END;

  IF EXISTS (
    SELECT 1
    FROM public.cre_agents agent
    WHERE agent.id = v_actor_id
  ) THEN
    RETURN v_actor_id;
  END IF;

  RETURN NULL;
END;
$$;

-- Derive actor type from the validated actor identifier.
CREATE OR REPLACE FUNCTION public.cre_event_actor_type()
RETURNS public.cre_event_actor_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.cre_event_actor_id() IS NULL
      THEN 'system'::public.cre_event_actor_type
    ELSE 'user'::public.cre_event_actor_type
  END
$$;

-- Resolve a transaction-local source or use the non-ambiguous DB fallback.
CREATE OR REPLACE FUNCTION public.cre_event_source()
RETURNS public.cre_event_source
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_source_setting text := NULLIF(
    current_setting('cre.audit.source', true),
    ''
  );
BEGIN
  IF v_source_setting IS NULL THEN
    RETURN 'database'::public.cre_event_source;
  END IF;

  BEGIN
    RETURN v_source_setting::public.cre_event_source;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN 'database'::public.cre_event_source;
  END;
END;
$$;

COMMENT ON FUNCTION public.cre_event_actor_id() IS
  'Returns a validated transaction-local Closer actor, or NULL for System.';

COMMENT ON FUNCTION public.cre_event_actor_type() IS
  'Returns user only when cre_event_actor_id resolves; otherwise system.';

COMMENT ON FUNCTION public.cre_event_source() IS
  'Returns a trusted transaction-local event source, or database as fallback.';

REVOKE ALL ON FUNCTION public.cre_event_actor_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cre_event_actor_type() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cre_event_source() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.cre_event_actor_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cre_event_actor_type() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cre_event_source() TO authenticated;

GRANT EXECUTE ON FUNCTION public.cre_event_actor_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.cre_event_actor_type() TO service_role;
GRANT EXECUTE ON FUNCTION public.cre_event_source() TO service_role;
