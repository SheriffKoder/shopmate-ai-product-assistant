-- Properties: separate display address from Places / street line.
--
-- `address` remains the agent-facing display label used across lists, maps,
-- drawers, and metrics. `address_line_1` stores the Google Places (or manually
-- typed) street line used with map coordinates.

ALTER TABLE public.cre_properties
  ADD COLUMN address_line_1 text;

-- Existing rows already have a display `address`; copy it so Places line is
-- never null after deploy, then harden the contract.
UPDATE public.cre_properties
SET address_line_1 = address
WHERE address_line_1 IS NULL OR btrim(address_line_1) = '';

ALTER TABLE public.cre_properties
  ALTER COLUMN address_line_1 SET NOT NULL,
  ADD CONSTRAINT cre_properties_address_line_1_not_blank
    CHECK (char_length(btrim(address_line_1)) > 0);

COMMENT ON COLUMN public.cre_properties.address IS
  'Manual display label shown across the product (lists, map pins, drawer titles).';

COMMENT ON COLUMN public.cre_properties.address_line_1 IS
  'Street / Places line (autofill or manual). Used with lat/lng for map location.';
