
CREATE TABLE public.platform_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  official_account_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.platform_settings(id) VALUES (true);
GRANT SELECT ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in read platform settings" ON public.platform_settings FOR SELECT TO authenticated USING (true);

CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (requester_id <> addressee_id)
);
CREATE UNIQUE INDEX friendships_pair_idx ON public.friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties read friendships" ON public.friendships FOR SELECT TO authenticated USING (auth.uid() IN (requester_id, addressee_id));
CREATE POLICY "Send pending request" ON public.friendships FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid() AND status = 'pending');
CREATE POLICY "Addressee answers request" ON public.friendships FOR UPDATE TO authenticated USING (addressee_id = auth.uid()) WITH CHECK (addressee_id = auth.uid() AND status IN ('accepted','declined'));
CREATE POLICY "Either party removes" ON public.friendships FOR DELETE TO authenticated USING (auth.uid() IN (requester_id, addressee_id));

CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX direct_messages_pair_idx ON public.direct_messages (sender_id, recipient_id, created_at);
GRANT SELECT ON public.direct_messages TO authenticated;
GRANT ALL ON public.direct_messages TO service_role;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties read messages" ON public.direct_messages FOR SELECT TO authenticated USING (auth.uid() IN (sender_id, recipient_id));

CREATE TABLE public.platform_bans (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  banned_by uuid,
  banned_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_bans TO authenticated;
GRANT ALL ON public.platform_bans TO service_role;
ALTER TABLE public.platform_bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own ban or admin read" ON public.platform_bans FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.safety_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  channel text NOT NULL DEFAULT 'direct',
  body text NOT NULL,
  category text NOT NULL,
  severity text NOT NULL,
  ai_reason text,
  fingerprint jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','dismissed','banned')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.safety_flags TO authenticated;
GRANT ALL ON public.safety_flags TO service_role;
ALTER TABLE public.safety_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read safety flags" ON public.safety_flags FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.authority_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id uuid NOT NULL REFERENCES public.safety_flags(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  evidence jsonb NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.authority_reports TO authenticated;
GRANT ALL ON public.authority_reports TO service_role;
ALTER TABLE public.authority_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read authority reports" ON public.authority_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Banned members cannot post in Overchat or send friend requests.
CREATE POLICY "Banned members cannot post" ON public.overchat_messages AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT EXISTS (SELECT 1 FROM public.platform_bans b WHERE b.user_id = auth.uid()));
CREATE POLICY "Banned members cannot request" ON public.friendships AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT EXISTS (SELECT 1 FROM public.platform_bans b WHERE b.user_id = auth.uid()));

-- Admin decision: human decides; a ban queues the authority report with evidence.
CREATE OR REPLACE FUNCTION public.review_safety_flag(_flag_id uuid, _decision text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.safety_flags;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  IF _decision NOT IN ('dismissed','banned') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  SELECT * INTO f FROM public.safety_flags WHERE id = _flag_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Flag not found'; END IF;
  IF f.status <> 'pending' THEN RAISE EXCEPTION 'Flag already reviewed'; END IF;
  UPDATE public.safety_flags SET status = _decision, reviewed_by = auth.uid(), reviewed_at = now() WHERE id = _flag_id;
  IF _decision = 'banned' THEN
    INSERT INTO public.platform_bans(user_id, reason, banned_by) VALUES (f.sender_id, f.category, auth.uid()) ON CONFLICT (user_id) DO NOTHING;
    DELETE FROM public.friendships WHERE f.sender_id IN (requester_id, addressee_id);
    INSERT INTO public.authority_reports(flag_id, user_id, evidence)
      VALUES (f.id, f.sender_id, jsonb_build_object('body', f.body, 'category', f.category, 'severity', f.severity,
        'ai_reason', f.ai_reason, 'fingerprint', f.fingerprint, 'recipient_id', f.recipient_id, 'flagged_at', f.created_at));
  END IF;
END; $$;
REVOKE EXECUTE ON FUNCTION public.review_safety_flag(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_safety_flag(uuid, text) TO authenticated;

-- Find members by name to send a friend request (names only).
CREATE OR REPLACE FUNCTION public.search_members(_q text)
RETURNS TABLE(id uuid, display_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.display_name FROM public.profiles p
  WHERE auth.uid() IS NOT NULL AND p.id <> auth.uid() AND char_length(trim(_q)) >= 2
    AND p.display_name ILIKE '%' || trim(_q) || '%'
    AND NOT EXISTS (SELECT 1 FROM public.platform_bans b WHERE b.user_id = p.id)
  ORDER BY p.display_name LIMIT 10;
$$;
REVOKE EXECUTE ON FUNCTION public.search_members(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_members(text) TO authenticated;

-- Names for my friends/requests (profiles RLS hides non-opted-in members).
CREATE OR REPLACE FUNCTION public.my_connections()
RETURNS TABLE(friendship_id uuid, other_id uuid, display_name text, status text, incoming boolean, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.id, o.id, o.display_name, f.status, f.addressee_id = auth.uid(), f.created_at
  FROM public.friendships f
  JOIN public.profiles o ON o.id = CASE WHEN f.requester_id = auth.uid() THEN f.addressee_id ELSE f.requester_id END
  WHERE auth.uid() IN (f.requester_id, f.addressee_id) AND f.status <> 'declined'
  ORDER BY f.created_at DESC;
$$;
REVOKE EXECUTE ON FUNCTION public.my_connections() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_connections() TO authenticated;

-- Owner account: admin role + official AGN account once its email is confirmed.
CREATE OR REPLACE FUNCTION public.grant_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'midwest.ops@proton.me' AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.profiles(id, display_name, participant_type) VALUES (NEW.id, 'AGN', 'viewer') ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
    UPDATE public.platform_settings SET official_account_id = NEW.id, updated_at = now() WHERE id AND official_account_id IS NULL;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER agn_grant_owner_admin AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_owner_admin();

-- Every new member starts friends with the official AGN account.
CREATE OR REPLACE FUNCTION public.befriend_official_account()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE official uuid;
BEGIN
  SELECT official_account_id INTO official FROM public.platform_settings WHERE id;
  IF official IS NOT NULL AND official <> NEW.id THEN
    INSERT INTO public.friendships(requester_id, addressee_id, status) VALUES (official, NEW.id, 'accepted') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER agn_befriend_official AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.befriend_official_account();
