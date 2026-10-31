CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT 'Participant' CHECK (char_length(display_name) BETWEEN 1 AND 32),
 participant_type text NOT NULL DEFAULT 'viewer' CHECK (participant_type IN ('viewer','player')),
 leaderboard_visible boolean NOT NULL DEFAULT false,
 avatar_key text NOT NULL DEFAULT 'crest' CHECK (avatar_key IN ('crest','shield','swords')),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.profiles TO authenticated;
GRANT UPDATE (display_name, participant_type, leaderboard_visible, avatar_key) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile or opted in participants" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR leaderboard_visible = true);
CREATE POLICY "Create own participant profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Edit own participant profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TABLE public.participant_rewards (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
 rank_key text NOT NULL DEFAULT 'participant' CHECK (rank_key IN ('participant','bronze','silver','gold','master')),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.participant_rewards TO authenticated;
GRANT ALL ON public.participant_rewards TO service_role;
ALTER TABLE public.participant_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own rewards or opted in leaderboard" ON public.participant_rewards FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_id AND p.leaderboard_visible = true));
CREATE OR REPLACE FUNCTION public.create_participant_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
 INSERT INTO public.profiles(id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
 INSERT INTO public.participant_rewards(user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
 RETURN NEW;
 END; $$;
REVOKE EXECUTE ON FUNCTION public.create_participant_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER agn_create_participant_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_participant_profile();
INSERT INTO public.profiles(id) SELECT id FROM auth.users ON CONFLICT DO NOTHING;
INSERT INTO public.participant_rewards(user_id) SELECT id FROM public.profiles ON CONFLICT DO NOTHING;
COMMENT ON TABLE public.participant_rewards IS 'Server-maintained authoritative rewards. Clients cannot grant points or Master status. Scoring remains inactive until engagement rules and thresholds are approved.';