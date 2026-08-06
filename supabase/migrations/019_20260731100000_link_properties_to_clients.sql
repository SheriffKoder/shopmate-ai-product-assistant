/**
 * @file supabase/migrations/019_20260731100000_link_properties_to_clients.sql
 * Adds the transitional property-to-client foreign-key contract.
 *
 * Purpose: Let properties reference a canonical client while existing owner
 * contact columns remain available until the application read/write cutover.
 * Used in: Supabase migration history and property repository work (steps 1–3).
 *
 * Steps:
 * 1. Add a nullable client_id so existing property rows remain valid.
 * 2. Add the foreign key to the existing cre_clients table.
 * 3. Index the relationship for property list filtering and joins.
 */

ALTER TABLE public.cre_properties
  ADD COLUMN client_id uuid;

ALTER TABLE public.cre_properties
  ADD CONSTRAINT cre_properties_client_id_fkey
  FOREIGN KEY (client_id)
  REFERENCES public.cre_clients (id)
  ON DELETE SET NULL;

CREATE INDEX idx_cre_properties_client_id
  ON public.cre_properties (client_id);

COMMENT ON COLUMN public.cre_properties.client_id IS
  'Optional client linked to this property; owner contact fields remain transitional.';
