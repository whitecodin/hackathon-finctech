
CREATE OR REPLACE FUNCTION public.clear_my_shop_records(p_confirmation text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE mid bigint;
BEGIN
 IF p_confirmation <> 'DELETE MY SHOP DATA' THEN RAISE EXCEPTION 'Confirmation phrase does not match'; END IF;
 SELECT id INTO mid FROM public.merchants WHERE user_id=(SELECT auth.uid()) LIMIT 1 FOR UPDATE;
 IF mid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 DELETE FROM public.shop_payment_webhook_events WHERE merchant_id=mid;
 DELETE FROM public.shop_payment_connections WHERE merchant_id=mid;
 DELETE FROM public.shop_payment_link_requests WHERE merchant_id=mid;
 DELETE FROM public.shop_reconciliation WHERE merchant_id=mid;
 DELETE FROM public.shop_stock_movements WHERE merchant_id=mid;
 DELETE FROM public.mohalla_pledges WHERE merchant_id=mid;
 DELETE FROM public.mohalla_campaigns WHERE merchant_id=mid;
 DELETE FROM public.shop_dues WHERE merchant_id=mid;
 DELETE FROM public.shop_contacts WHERE merchant_id=mid;
 DELETE FROM public.shop_stock WHERE merchant_id=mid;
 DELETE FROM public.shop_entries WHERE merchant_id=mid;
 DELETE FROM public.transactions WHERE merchant_id=mid;
 DELETE FROM public.merchant_league_preferences WHERE merchant_id=mid;
 DELETE FROM public.league_snapshots WHERE merchant_id=mid;
 DELETE FROM public.shop_audit WHERE merchant_id=mid;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.clear_my_shop_records(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.clear_my_shop_records(text) TO authenticated;
