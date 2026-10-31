CREATE TABLE public.vault_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  callsign text NOT NULL CHECK (char_length(callsign) BETWEEN 3 AND 24),
  email text NOT NULL CHECK (char_length(email) <= 255),
  date_of_birth date NOT NULL,
  age_confirmed boolean NOT NULL,
  terms_accepted boolean NOT NULL,
  mock_verification_status text NOT NULL DEFAULT 'mock_passed' CHECK (mock_verification_status IN ('mock_passed','mock_failed')),
  identity_verification_status text NOT NULL DEFAULT 'not_started' CHECK (identity_verification_status IN ('not_started','pending','verified','failed')),
  identity_verification_provider text,
  identity_verification_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.vault_registrations TO anon;
GRANT ALL ON public.vault_registrations TO service_role;
ALTER TABLE public.vault_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a registration" ON public.vault_registrations
  FOR INSERT TO anon
  WITH CHECK (
    age_confirmed AND terms_accepted
    AND mock_verification_status = 'mock_passed'
    AND identity_verification_status = 'not_started'
    AND identity_verification_provider IS NULL
    AND identity_verification_reference IS NULL
  );