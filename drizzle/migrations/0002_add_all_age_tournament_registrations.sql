CREATE TABLE public.tournament_registrations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 callsign text NOT NULL CHECK (char_length(callsign) BETWEEN 3 AND 24 AND callsign ~ '^[a-zA-Z0-9_]+$'),
 lane smallint NOT NULL CHECK (lane BETWEEN 1 AND 6),
 pricing_option text NOT NULL CHECK (pricing_option IN ('franchise', 'weekly')),
 quoted_fee_cents integer NOT NULL CHECK (quoted_fee_cents > 0),
 terms_accepted boolean NOT NULL CHECK (terms_accepted = true),
 payment_status text NOT NULL DEFAULT 'not_started' CHECK (payment_status = 'not_started'),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (user_id, lane)
);
GRANT SELECT, INSERT ON public.tournament_registrations TO authenticated;
GRANT ALL ON public.tournament_registrations TO service_role;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own tournament registrations" ON public.tournament_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Save own unpaid tournament registration" ON public.tournament_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND payment_status = 'not_started' AND terms_accepted = true AND quoted_fee_cents = CASE WHEN pricing_option = 'franchise' THEN CASE WHEN lane IN (2,6) THEN 37500 ELSE 187500 END ELSE CASE WHEN lane IN (2,6) THEN 5000 ELSE 25000 END END);
COMMENT ON TABLE public.tournament_registrations IS 'All-age tournament registration interest only; no DOB, wager permission, paid entitlement, or identity verification is conferred.';