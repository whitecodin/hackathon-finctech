
CREATE OR REPLACE FUNCTION public.confirm_my_provider_duplicate(p_manual_id uuid,p_provider_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE mid bigint; m public.shop_entries%ROWTYPE; p public.shop_entries%ROWTYPE;
BEGIN
 SELECT id INTO mid FROM public.merchants WHERE user_id=(SELECT auth.uid()) LIMIT 1;
 IF mid IS NULL OR p_manual_id=p_provider_id THEN RAISE EXCEPTION 'Sign in required'; END IF;
 SELECT * INTO m FROM public.shop_entries WHERE id=p_manual_id AND merchant_id=mid AND source='manual' FOR UPDATE;
 SELECT * INTO p FROM public.shop_entries WHERE id=p_provider_id AND merchant_id=mid AND source='provider' FOR UPDATE;
 IF m.id IS NULL OR p.id IS NULL OR m.matched_provider_entry_id IS NOT NULL OR
 m.amount<>p.amount OR m.kind<>p.kind OR m.payment_method NOT IN ('UPI','Bank') OR
 abs(m.entry_date-p.entry_date)>2 THEN
  RAISE EXCEPTION 'Entries do not match or have already been reviewed';
 END IF;
 UPDATE public.shop_entries SET matched_provider_entry_id=p_provider_id
 WHERE id=p_manual_id AND merchant_id=mid AND matched_provider_entry_id IS NULL;
 RETURN FOUND;
END $$;
REVOKE ALL ON FUNCTION public.confirm_my_provider_duplicate(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.confirm_my_provider_duplicate(uuid,uuid) TO authenticated;
