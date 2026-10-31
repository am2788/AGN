CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 role public.app_role NOT NULL,
 UNIQUE(user_id,role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own admin assignment" ON public.user_roles FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT auth.uid() = _user_id AND EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role)
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated;
CREATE FUNCTION public.admin_monitoring_snapshot() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required' USING ERRCODE='42501'; END IF;
 RETURN jsonb_build_object(
 'checkedAt',now(),
 'accounts',(SELECT count(*) FROM public.profiles),
 'players',(SELECT count(*) FROM public.profiles WHERE participant_type='player'),
 'viewers',(SELECT count(*) FROM public.profiles WHERE participant_type='viewer'),
 'registrations',(SELECT count(*) FROM public.tournament_registrations),
 'pausedAvatarRequests',(SELECT count(*) FROM public.avatar_forge_blocks)
 );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_monitoring_snapshot() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_monitoring_snapshot() TO authenticated;
COMMENT ON TABLE public.user_roles IS 'Trusted admin assignment only. Never auto-promote first signup or use editable profile fields.';