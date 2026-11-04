CREATE OR REPLACE FUNCTION public.official_account_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT official_account_id FROM public.platform_settings WHERE id $$;
REVOKE ALL ON FUNCTION public.official_account_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.official_account_id() TO authenticated;

CREATE OR REPLACE FUNCTION public.agn_welcome_member(_official uuid, _member uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF _official IS NULL OR _official = _member THEN RETURN; END IF;
  INSERT INTO public.friendships(requester_id, addressee_id, status) VALUES (_official, _member, 'accepted') ON CONFLICT DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.direct_messages WHERE sender_id = _official AND recipient_id = _member) THEN
    INSERT INTO public.direct_messages(sender_id, recipient_id, body)
    VALUES (_official, _member, 'Welcome to AGN — Aether Gaming Networks. Your account is live. Head to the Arena to see schedules, set up your calling card, and climb the ranks. This is an automated message, so replies are turned off. See you in the lobby.');
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.agn_welcome_member(uuid, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.befriend_official_account()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.agn_welcome_member((SELECT official_account_id FROM public.platform_settings WHERE id), NEW.id);
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.grant_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE p record;
BEGIN
  IF lower(NEW.email) = 'midwest.ops@proton.me' AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.profiles(id, display_name, participant_type) VALUES (NEW.id, 'AGN', 'viewer') ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
    UPDATE public.platform_settings SET official_account_id = NEW.id, updated_at = now() WHERE id AND official_account_id IS NULL;
    IF (SELECT official_account_id FROM public.platform_settings WHERE id) = NEW.id THEN
      FOR p IN SELECT id FROM public.profiles WHERE id <> NEW.id LOOP
        PERFORM public.agn_welcome_member(NEW.id, p.id);
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END $$;