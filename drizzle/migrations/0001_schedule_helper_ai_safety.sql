CREATE TABLE public.schedule_helper_ai_state (id text PRIMARY KEY, status integer NOT NULL, message text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_helper_ai_state TO service_role;
REVOKE ALL ON public.schedule_helper_ai_state FROM anon, authenticated;
ALTER TABLE public.schedule_helper_ai_state ENABLE ROW LEVEL SECURITY;