
-- Bazaar League 2.0: opt-in, regional, pseudonymous and private.
-- City/district/state are self-declared until an authoritative PIN mapping is deployed.
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '';
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS district text NOT NULL DEFAULT '';
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT '';
ALTER TABLE public.league_snapshots ADD COLUMN IF NOT EXISTS district text NOT NULL DEFAULT '';
ALTER TABLE public.league_snapshots ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT '';
ALTER TABLE public.league_snapshots ADD COLUMN IF NOT EXISTS growth_percent integer;
DROP POLICY IF EXISTS "opted in view of qualifying city peers" ON public.league_snapshots;
REVOKE ALL ON public.league_snapshots FROM anon,authenticated;
CREATE OR REPLACE FUNCTION league_internal.refresh_league_snapshots() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 DELETE FROM public.league_snapshots;
 INSERT INTO public.league_snapshots
 (merchant_id,display_alias,category,city,pin_code,average_daily_gross,cohort_city,cohort_local,updated_at,district,state,growth_percent)
 WITH activity AS (
 SELECT m.id AS merchant_id,p.display_alias,
 lower(trim(m.category)) AS category,lower(trim(m.city)) AS city,
 lower(trim(m.district)) AS district,lower(trim(m.state)) AS state,
 m.pin_code,
 coalesce(sum(t.amount) FILTER (WHERE t.type='inflow' AND t.date >= now()-interval '30 days'),0) AS curr,
 coalesce(sum(t.amount) FILTER (WHERE t.type='inflow' AND t.date >= now()-interval '60 days' AND t.date < now()-interval '30 days'),0) AS previous,
 count(distinct (t.date AT TIME ZONE 'Asia/Kolkata')::date) FILTER (WHERE t.type='inflow' AND t.date >= now()-interval '30 days') AS current_days,
 count(distinct (t.date AT TIME ZONE 'Asia/Kolkata')::date) FILTER (WHERE t.type='inflow' AND t.date >= now()-interval '60 days' AND t.date < now()-interval '30 days') AS previous_days
 FROM public.merchants m
 JOIN public.merchant_league_preferences p ON p.merchant_id=m.id AND p.opted_in
 LEFT JOIN public.transactions t ON t.merchant_id=m.id AND t.date>=now()-interval '60 days'
 WHERE m.pin_code ~ '^[0-9]{6}$'
 AND trim(m.category)<>'' AND trim(m.city)<>'' AND trim(m.district)<>'' AND trim(m.state)<>''
 GROUP BY m.id,p.display_alias,m.category,m.city,m.district,m.state,m.pin_code
 ), eligible AS (
 SELECT *, greatest(0,round(curr/30.0/100.0)*100)::integer AS avg_gross,
 CASE WHEN previous>=1000 AND previous_days>=5
 THEN greatest(-100,least(300,round((curr/previous-1)*100)::integer))
 ELSE NULL END AS growth
 FROM activity WHERE current_days>=5
 ), cohorts AS(
 SELECT *,count(*) OVER(PARTITION BY category,city,state)::integer AS city_n,
 count(*) OVER(PARTITION BY category,pin_code)::integer AS local_n
 FROM eligible
 )
 SELECT merchant_id,display_alias,category,city,pin_code,avg_gross,city_n,local_n,now(),district,state,growth
 FROM cohorts;
END;
$$;
REVOKE ALL ON FUNCTION league_internal.refresh_league_snapshots() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.get_bazaar_league(p_scope text DEFAULT 'local',p_mode text DEFAULT 'activity')
RETURNS TABLE(alias text,place integer,is_self boolean,cohort_size integer,growth_percent integer,region_name text,refreshed_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF (select auth.uid()) IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='28000'; END IF;
 IF p_scope NOT IN ('local','city','district','state') OR p_mode NOT IN ('activity','growth') THEN
 RAISE EXCEPTION 'Invalid league filter' USING ERRCODE='22023'; END IF;
 RETURN QUERY
 WITH mine AS (
 SELECT m.id,m.pin_code,lower(trim(m.city)) AS city,lower(trim(m.district)) AS district,
 lower(trim(m.state)) AS state,lower(trim(m.category)) AS category
 FROM public.merchants m JOIN public.merchant_league_preferences pref ON pref.merchant_id=m.id
 WHERE m.user_id=(select auth.uid()) AND pref.opted_in AND m.pin_code ~ '^[0-9]{6}$'
 LIMIT 1
 ), matches AS(
 SELECT s.display_alias,s.merchant_id,s.average_daily_gross,s.growth_percent,s.updated_at,m.id AS own_id,
 CASE p_scope WHEN 'local' THEN 'PIN '||m.pin_code WHEN 'city' THEN m.city WHEN 'district' THEN m.district WHEN 'state' THEN m.state ELSE '' END AS region
 FROM mine m JOIN public.league_snapshots s ON s.category=m.category
 WHERE ((p_scope='local' AND s.pin_code=m.pin_code) OR
 (p_scope='city' AND s.city=m.city AND s.state=m.state AND m.city<>'') OR
 (p_scope='district' AND s.district=m.district AND s.state=m.state AND m.district<>'') OR
 (p_scope='state' AND s.state=m.state AND m.state<>''))
 AND (p_mode='activity' OR s.growth_percent IS NOT NULL)
 ), ranked AS(
 SELECT matches.*,count(*) OVER()::integer AS n,
 row_number() OVER(ORDER BY
 CASE WHEN p_mode='growth' THEN matches.growth_percent ELSE matches.average_daily_gross END DESC NULLS LAST,
 matches.merchant_id)::integer AS rank
 FROM matches
 )
 SELECT r.display_alias,r.rank,(r.merchant_id=r.own_id),r.n,
 CASE WHEN p_mode='growth' THEN r.growth_percent ELSE NULL END,r.region,r.updated_at
 FROM ranked r
 WHERE r.n>=5 ORDER BY r.rank LIMIT 100;
END;
$$;
REVOKE ALL ON FUNCTION public.get_bazaar_league(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_bazaar_league(text,text) TO authenticated;
-- More responsive snapshots while maintaining a bounded, server-side refresh cadence.
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname='vyapartrust-league-daily';
SELECT cron.schedule('vyapartrust-league-half-hour','*/30 * * * *','SELECT league_internal.refresh_league_snapshots()');
