
DROP POLICY "campaign region read" ON public.mohalla_campaigns;
CREATE POLICY "campaign region or owner read" ON public.mohalla_campaigns FOR SELECT TO authenticated USING(
 merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid()))
 OR EXISTS(SELECT 1 FROM public.merchants m WHERE m.user_id=(SELECT auth.uid())
  AND lower(trim(m.city))=lower(trim(mohalla_campaigns.city))
  AND lower(trim(m.state))=lower(trim(mohalla_campaigns.state))
  AND trim(m.city)<>'' AND trim(m.state)<>'')
);
