
DROP POLICY "pledge mine edit" ON public.mohalla_pledges;
CREATE POLICY "pledge mine edit" ON public.mohalla_pledges FOR UPDATE TO authenticated
 USING(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())))
 WITH CHECK(
 merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid()))
 AND EXISTS(
  SELECT 1 FROM public.mohalla_campaigns c
  JOIN public.merchants m ON m.id=mohalla_pledges.merchant_id AND m.user_id=(SELECT auth.uid())
  WHERE c.id=mohalla_pledges.campaign_id AND c.closes_on>=current_date
   AND lower(trim(c.city))=lower(trim(m.city))
   AND lower(trim(c.state))=lower(trim(m.state))
 )
);
