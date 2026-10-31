CREATE TABLE public.overchat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 32),
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 280),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.overchat_messages TO authenticated;
GRANT ALL ON public.overchat_messages TO service_role;
ALTER TABLE public.overchat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in members read overchat" ON public.overchat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members post as themselves" ON public.overchat_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE INDEX overchat_messages_created_idx ON public.overchat_messages (created_at DESC);

CREATE TABLE public.title_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  season text NOT NULL CHECK (season = '2026-S1'),
  title text NOT NULL CHECK (title IN ('call-of-duty','fortnite','street-fighter-6','valorant','rocket-league','apex-legends','tekken-8','ea-sports-fc')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, season)
);
GRANT SELECT, INSERT ON public.title_votes TO authenticated;
GRANT ALL ON public.title_votes TO service_role;
ALTER TABLE public.title_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own vote" ON public.title_votes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Members vote once while window open" ON public.title_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND now() < timestamptz '2026-12-21 00:00:00+00');

CREATE OR REPLACE FUNCTION public.title_vote_totals(_season text)
RETURNS TABLE(title text, votes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT title, count(*) FROM public.title_votes WHERE season = _season GROUP BY title
$$;
REVOKE ALL ON FUNCTION public.title_vote_totals(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.title_vote_totals(text) TO authenticated;