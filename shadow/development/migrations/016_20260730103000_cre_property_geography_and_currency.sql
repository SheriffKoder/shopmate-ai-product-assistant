-- Properties: explicit geography + source price currency.
--
-- Keep `address` as the street/building display string. Country and city are
-- independent fields so views never need to infer geography from free text.

ALTER TABLE public.cre_properties
  ADD COLUMN country text,
  ADD COLUMN city text,
  ADD COLUMN price_currency text;

-- Existing rows predate the explicit fields. Backfill before making the
-- contract required so deployed data and the API shape stay compatible.
UPDATE public.cre_properties
SET
  country = COALESCE(NULLIF(btrim(country), ''), 'United Arab Emirates'),
  city = COALESCE(NULLIF(btrim(city), ''), 'Dubai'),
  price_currency = COALESCE(NULLIF(btrim(price_currency), ''), 'AED');

ALTER TABLE public.cre_properties
  ALTER COLUMN country SET DEFAULT 'United Arab Emirates',
  ALTER COLUMN country SET NOT NULL,
  ALTER COLUMN city SET NOT NULL,
  ALTER COLUMN price_currency SET DEFAULT 'AED',
  ALTER COLUMN price_currency SET NOT NULL,
  ADD CONSTRAINT cre_properties_country_not_blank
    CHECK (char_length(btrim(country)) > 0),
  ADD CONSTRAINT cre_properties_city_not_blank
    CHECK (char_length(btrim(city)) > 0),
  ADD CONSTRAINT cre_properties_price_currency_iso_code
    CHECK (price_currency ~ '^[A-Z]{3}$');

CREATE INDEX idx_cre_properties_country_city
  ON public.cre_properties (country, city);
