
GRANT SELECT ON public.shop_ai_usage,public.shop_ai_daily_usage TO authenticated;
CREATE POLICY "owner read ai minute usage" ON public.shop_ai_usage FOR SELECT TO authenticated
 USING(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));
CREATE POLICY "owner read ai daily usage" ON public.shop_ai_daily_usage FOR SELECT TO authenticated
 USING(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));
