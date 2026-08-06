-- Closer initial schema (additive only).
-- Creates cre_* enums + tables. Does not DROP/TRUNCATE/ALTER any non-cre_* objects.
-- RLS: deferred to a later security phase — do not enable policies here.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.cre_agent_role AS ENUM ('admin', 'agent');
CREATE TYPE public.cre_property_type AS ENUM ('house', 'apartment', 'land', 'commercial');
CREATE TYPE public.cre_property_status AS ENUM ('available', 'under_offer', 'closed');
CREATE TYPE public.cre_client_stage AS ENUM (
  'lead',
  'contacted',
  'visited',
  'negotiating',
  'closed'
);
CREATE TYPE public.cre_interaction_type AS ENUM ('call', 'visit', 'meeting');
CREATE TYPE public.cre_interaction_source AS ENUM ('manual', 'ai');
CREATE TYPE public.cre_segment_type AS ENUM ('call', 'admin', 'break');
CREATE TYPE public.cre_showing_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.cre_agents (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  role public.cre_agent_role NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_cre_agents_email ON public.cre_agents (email);

CREATE TABLE public.cre_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  lat double precision,
  lng double precision,
  price numeric,
  property_type public.cre_property_type NOT NULL,
  bedrooms smallint,
  bathrooms smallint,
  status public.cre_property_status NOT NULL,
  agent_id uuid NOT NULL REFERENCES public.cre_agents (id),
  owner_name text,
  owner_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cre_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  agent_id uuid NOT NULL REFERENCES public.cre_agents (id),
  stage public.cre_client_stage NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cre_client_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.cre_clients (id),
  agent_id uuid NOT NULL REFERENCES public.cre_agents (id),
  type public.cre_interaction_type NOT NULL,
  notes text,
  outcome text,
  next_follow_up_at timestamptz,
  source public.cre_interaction_source NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cre_activity_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.cre_agents (id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  segment_type public.cre_segment_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cre_team_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.cre_agents (id),
  weekly_call_target integer NOT NULL,
  weekly_showing_target integer NOT NULL
);

-- One global default (agent_id IS NULL) and at most one override per agent.
CREATE UNIQUE INDEX idx_cre_team_targets_global
  ON public.cre_team_targets ((true))
  WHERE agent_id IS NULL;

CREATE UNIQUE INDEX idx_cre_team_targets_agent
  ON public.cre_team_targets (agent_id)
  WHERE agent_id IS NOT NULL;

CREATE TABLE public.cre_ad_prompt_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_prompt text NOT NULL,
  updated_by uuid REFERENCES public.cre_agents (id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cre_showings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.cre_properties (id),
  client_id uuid NOT NULL REFERENCES public.cre_clients (id),
  agent_id uuid NOT NULL REFERENCES public.cre_agents (id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status public.cre_showing_status NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes (query paths from product spec)
-- ---------------------------------------------------------------------------

CREATE INDEX idx_cre_properties_agent_id ON public.cre_properties (agent_id);
CREATE INDEX idx_cre_properties_status ON public.cre_properties (status);
CREATE INDEX idx_cre_clients_agent_id ON public.cre_clients (agent_id);
CREATE INDEX idx_cre_clients_stage ON public.cre_clients (stage);
CREATE INDEX idx_cre_client_interactions_client_id
  ON public.cre_client_interactions (client_id);
CREATE INDEX idx_cre_activity_segments_agent_start
  ON public.cre_activity_segments (agent_id, start_time);
