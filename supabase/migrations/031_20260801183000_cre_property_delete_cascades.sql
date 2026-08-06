-- Allow hard-delete of cre_properties by cascading property-owned children.
-- Status events are trigger-created on INSERT, so every listing had at least one
-- row blocking DELETE under the previous NO ACTION FKs.
-- Client interactions keep history: property_id is nulled instead of deleted.

-- Property status timeline (append-only via trigger)
ALTER TABLE public.cre_property_status_events
  DROP CONSTRAINT cre_property_status_events_property_id_fkey;

ALTER TABLE public.cre_property_status_events
  ADD CONSTRAINT cre_property_status_events_property_id_fkey
  FOREIGN KEY (property_id)
  REFERENCES public.cre_properties (id)
  ON DELETE CASCADE;

-- Closed deals tied to the listing
ALTER TABLE public.cre_property_transactions
  DROP CONSTRAINT cre_property_transactions_property_id_fkey;

ALTER TABLE public.cre_property_transactions
  ADD CONSTRAINT cre_property_transactions_property_id_fkey
  FOREIGN KEY (property_id)
  REFERENCES public.cre_properties (id)
  ON DELETE CASCADE;

-- Ad generation runs for the listing
ALTER TABLE public.cre_property_ad_generations
  DROP CONSTRAINT cre_property_ad_generations_property_id_fkey;

ALTER TABLE public.cre_property_ad_generations
  ADD CONSTRAINT cre_property_ad_generations_property_id_fkey
  FOREIGN KEY (property_id)
  REFERENCES public.cre_properties (id)
  ON DELETE CASCADE;

-- Showings for the listing (status events cascade from showings below)
ALTER TABLE public.cre_showings
  DROP CONSTRAINT cre_showings_property_id_fkey;

ALTER TABLE public.cre_showings
  ADD CONSTRAINT cre_showings_property_id_fkey
  FOREIGN KEY (property_id)
  REFERENCES public.cre_properties (id)
  ON DELETE CASCADE;

ALTER TABLE public.cre_showing_status_events
  DROP CONSTRAINT cre_showing_status_events_showing_id_fkey;

ALTER TABLE public.cre_showing_status_events
  ADD CONSTRAINT cre_showing_status_events_showing_id_fkey
  FOREIGN KEY (showing_id)
  REFERENCES public.cre_showings (id)
  ON DELETE CASCADE;

-- Optional property link on interactions — preserve the interaction row
ALTER TABLE public.cre_client_interactions
  DROP CONSTRAINT cre_client_interactions_property_id_fkey;

ALTER TABLE public.cre_client_interactions
  ADD CONSTRAINT cre_client_interactions_property_id_fkey
  FOREIGN KEY (property_id)
  REFERENCES public.cre_properties (id)
  ON DELETE SET NULL;
