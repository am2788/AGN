CREATE TABLE public.registration_control (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','PAUSED','CLOSED')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT ON public.registration_control TO anon, authenticated;
GRANT UPDATE (status) ON public.registration_control TO authenticated;
GRANT ALL ON public.registration_control TO service_role;
ALTER TABLE public.registration_control ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read registration status" ON public.registration_control FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins change registration status" ON public.registration_control FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.registration_control (id, status) VALUES (true, 'OPEN');

CREATE TABLE public.registration_control_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.registration_control_log TO authenticated;
GRANT ALL ON public.registration_control_log TO service_role;
ALTER TABLE public.registration_control_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read registration log" ON public.registration_control_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.stamp_registration_control() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  INSERT INTO public.registration_control_log (status, changed_by) VALUES (NEW.status, auth.uid());
  RETURN NEW;
END $$;
CREATE TRIGGER registration_control_stamp BEFORE UPDATE ON public.registration_control
  FOR EACH ROW EXECUTE FUNCTION public.stamp_registration_control();

CREATE OR REPLACE FUNCTION public.enforce_registration_open() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT status FROM public.registration_control WHERE id) IS DISTINCT FROM 'OPEN' THEN
    RAISE EXCEPTION 'REGISTRATION_NOT_OPEN';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER tournament_registrations_open_gate BEFORE INSERT ON public.tournament_registrations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_registration_open();

CREATE OR REPLACE FUNCTION public.admin_lane_entry_counts() RETURNS TABLE (lane int, entries bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  RETURN QUERY SELECT r.lane, count(*) FROM public.tournament_registrations r GROUP BY r.lane;
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_lane_entry_counts() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_lane_entry_counts() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.stamp_registration_control() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_registration_open() FROM anon, authenticated, public;