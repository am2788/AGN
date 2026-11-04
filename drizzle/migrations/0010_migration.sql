ALTER TABLE public.tournament_registrations DROP CONSTRAINT tournament_registrations_payment_status_check;
ALTER TABLE public.tournament_registrations ADD CONSTRAINT tournament_registrations_payment_status_check
  CHECK (payment_status IN ('not_started','pending','paid','installments_active','past_due','installments_complete','failed'));

-- Award the 250 entry points only once payment is confirmed (idempotent via the ledger's unique key).
CREATE OR REPLACE FUNCTION public.reward_tournament_entry() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.payment_status IN ('paid','installments_active','installments_complete') THEN
    PERFORM public.award_verified_engagement(NEW.user_id,'tournament_entry',NEW.id::text);
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.reward_tournament_entry() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS reward_tournament_entry ON public.tournament_registrations;
CREATE TRIGGER reward_tournament_entry AFTER INSERT OR UPDATE OF payment_status ON public.tournament_registrations
  FOR EACH ROW EXECUTE FUNCTION public.reward_tournament_entry();