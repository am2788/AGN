DO $$ DECLARE c text; BEGIN
  SELECT conname INTO c FROM pg_constraint WHERE conrelid='public.tournament_registrations'::regclass AND pg_get_constraintdef(oid) LIKE '%payment_status%';
  IF c IS NOT NULL THEN EXECUTE format('ALTER TABLE public.tournament_registrations DROP CONSTRAINT %I', c); END IF;
END $$;
ALTER TABLE public.tournament_registrations ADD CONSTRAINT tournament_registrations_payment_status_check
  CHECK (payment_status IN ('not_started','pending','paid','installments_active','installments_complete','failed'));

-- Users may only insert 'not_started'; paid states are written by the payment webhook (service role).
CREATE OR REPLACE FUNCTION public.enforce_registration_payment_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    IF TG_OP = 'INSERT' AND NEW.payment_status <> 'not_started' THEN RAISE EXCEPTION 'payment_status is server-owned'; END IF;
    IF TG_OP = 'UPDATE' AND NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN RAISE EXCEPTION 'payment_status is server-owned'; END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_registration_payment_status ON public.tournament_registrations;
CREATE TRIGGER trg_registration_payment_status BEFORE INSERT OR UPDATE ON public.tournament_registrations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_registration_payment_status();

CREATE TABLE public.tournament_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.tournament_registrations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  price_id text NOT NULL,
  stripe_session_id text UNIQUE,
  stripe_subscription_id text,
  amount_cents integer,
  status text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('sandbox','live')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.tournament_payments(user_id);
ALTER TABLE public.tournament_payments ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.tournament_payments TO authenticated;
GRANT ALL ON public.tournament_payments TO service_role;
CREATE POLICY "Owners view own tournament payments" ON public.tournament_payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);