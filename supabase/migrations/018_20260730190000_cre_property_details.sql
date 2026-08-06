-- Store optional long-form listing context without exposing it as a list column.
ALTER TABLE public.cre_properties
  ADD COLUMN details text;

COMMENT ON COLUMN public.cre_properties.details IS
  'Optional long-form property description edited and viewed in the Property drawer.';
