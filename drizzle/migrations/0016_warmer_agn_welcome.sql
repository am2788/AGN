CREATE OR REPLACE FUNCTION public.agn_welcome_member(_official uuid, _member uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF _official IS NULL OR _official = _member THEN RETURN; END IF;
  INSERT INTO public.friendships(requester_id, addressee_id, status) VALUES (_official, _member, 'accepted') ON CONFLICT DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.direct_messages WHERE sender_id = _official AND recipient_id = _member) THEN
    INSERT INTO public.direct_messages(sender_id, recipient_id, body)
    VALUES (_official, _member, 'Welcome to AGN — honestly, thank you for signing up. It means a lot that you would choose to spend your time here with us. This whole network is being built for people who love the game, and having you in it is exactly the point. Take a wander through the Arena when you get a minute: the schedules are there, your calling card is yours to make, and the ranks will wait for you. This is our official account, so replies are turned off for now, but the door is open. Thanks again for being here. See you in the lobby.');
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.agn_welcome_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.agn_welcome_member(uuid, uuid) TO service_role;