DROP POLICY IF EXISTS "Anyone can read registration status" ON public.registration_control;
CREATE POLICY "Admins read registration status" ON public.registration_control FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
REVOKE SELECT ON public.registration_control FROM anon;

DROP POLICY IF EXISTS "Signed-in read platform settings" ON public.platform_settings;
CREATE POLICY "Admins read platform settings" ON public.platform_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Signed-in members read overchat" ON public.overchat_messages;
CREATE POLICY "Unbanned members read overchat" ON public.overchat_messages FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.platform_bans b WHERE b.user_id = auth.uid()));