-- Effective Property closings and their monetary values.
-- Closed status may exist without a transaction because it also means
-- unavailable/off-market.

CREATE TABLE public.cre_property_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.cre_properties (id),
  client_id uuid REFERENCES public.cre_clients (id),
  agent_id uuid NOT NULL REFERENCES public.cre_agents (id),
  closed_at timestamptz NOT NULL,
  closing_price numeric NOT NULL,
  currency text NOT NULL,
  commission_amount numeric,
  commission_currency text,
  created_by uuid REFERENCES public.cre_agents (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  voided_at timestamptz,
  voided_by uuid REFERENCES public.cre_agents (id),
  CONSTRAINT cre_property_transactions_closing_price_positive
    CHECK (closing_price > 0),
  CONSTRAINT cre_property_transactions_currency_iso
    CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT cre_property_transactions_commission_nonnegative
    CHECK (commission_amount IS NULL OR commission_amount >= 0),
  CONSTRAINT cre_property_transactions_commission_currency_iso
    CHECK (
      commission_currency IS NULL
      OR commission_currency ~ '^[A-Z]{3}$'
    ),
  CONSTRAINT cre_property_transactions_commission_pair
    CHECK (
      (commission_amount IS NULL) = (commission_currency IS NULL)
    ),
  CONSTRAINT cre_property_transactions_void_pair
    CHECK (
      (voided_at IS NULL AND voided_by IS NULL)
      OR voided_at IS NOT NULL
    )
);

CREATE UNIQUE INDEX idx_cre_property_transactions_one_effective
  ON public.cre_property_transactions (property_id)
  WHERE voided_at IS NULL;

CREATE INDEX idx_cre_property_transactions_scope_period
  ON public.cre_property_transactions (agent_id, closed_at DESC);

CREATE INDEX idx_cre_property_transactions_client
  ON public.cre_property_transactions (client_id)
  WHERE client_id IS NOT NULL;

ALTER TABLE public.cre_property_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY cre_property_transactions_select_scoped
  ON public.cre_property_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.cre_properties property
      WHERE property.id = cre_property_transactions.property_id
        AND public.cre_can_access_agent(property.agent_id)
    )
  );

CREATE POLICY cre_property_transactions_insert_scoped
  ON public.cre_property_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.cre_can_access_agent(agent_id)
    AND created_by = public.cre_current_agent_id()
    AND voided_at IS NULL
    AND voided_by IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.cre_properties property
      WHERE property.id = property_id
        AND property.agent_id = agent_id
        AND property.status = 'closed'
    )
    AND (
      client_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.cre_clients client
        WHERE client.id = client_id
          AND public.cre_can_access_agent(client.agent_id)
      )
    )
  );

-- Reopening a Property makes its one effective transaction historical.
CREATE OR REPLACE FUNCTION public.cre_void_transaction_on_property_reopen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'closed' AND NEW.status <> 'closed' THEN
    UPDATE public.cre_property_transactions AS property_transaction
    SET
      voided_at = now(),
      voided_by = public.cre_event_actor_id()
    WHERE property_transaction.property_id = NEW.id
      AND property_transaction.voided_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.cre_void_transaction_on_property_reopen()
  FROM PUBLIC;

CREATE TRIGGER cre_properties_void_transaction_on_reopen
AFTER UPDATE OF status
ON public.cre_properties
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.cre_void_transaction_on_property_reopen();
