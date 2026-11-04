ALTER TABLE public.profiles ADD COLUMN theme_key text NOT NULL DEFAULT 'detailed';
ALTER TABLE public.profiles ADD COLUMN equipped_card_key text;
COMMENT ON COLUMN public.profiles.theme_key IS 'Site appearance theme: detailed (default), simple-gold, or simple-neon. Free cosmetic preference, not point-gated.';
COMMENT ON COLUMN public.profiles.equipped_card_key IS 'Stable key of the equipped calling-card artwork from the public registry. NULL means rank-default artwork. Server-validated against ownership and unlock eligibility.';