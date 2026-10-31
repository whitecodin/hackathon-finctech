GRANT SELECT ON public.shop_payment_webhook_events TO authenticated;
CREATE POLICY "own payment webhook metadata" ON public.shop_payment_webhook_events
 FOR SELECT TO authenticated USING(merchant_id IN (SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));
