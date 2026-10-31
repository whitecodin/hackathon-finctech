
CREATE OR REPLACE FUNCTION public.ingest_verified_razorpay_event(
 p_account_id text,p_event_id text,p_event_type text,p_transaction_id text,
 p_amount_paise bigint,p_timestamp timestamptz,p_method text DEFAULT 'upi'
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE mid bigint; event_row bigint; entry_id uuid; entry_kind text; source_method text;
DECLARE paired uuid; candidates int; reference_key text;
BEGIN
 IF p_event_type NOT IN('payment.captured','qr_code.credited','payout.processed','payout.reversed','refund.processed') THEN RETURN 'ignored'; END IF;
 IF p_event_id IS NULL OR length(p_event_id)<8 OR length(p_event_id)>120 OR
 p_transaction_id IS NULL OR length(p_transaction_id)<5 OR length(p_transaction_id)>120 OR
 p_timestamp IS NULL OR p_amount_paise IS NULL OR p_amount_paise<=0 OR p_amount_paise>10000000000 OR
 p_timestamp>now()+interval '10 minutes' OR p_timestamp<now()-interval '180 days' THEN RAISE EXCEPTION 'Invalid provider event'; END IF;
 SELECT merchant_id INTO mid FROM public.shop_payment_connections
 WHERE provider='razorpay' AND provider_account_id=p_account_id AND status='active';
 IF mid IS NULL THEN RETURN 'unlinked'; END IF;
 INSERT INTO public.shop_payment_webhook_events(merchant_id,provider,provider_account_id,event_id,event_type,provider_transaction_id)
 VALUES(mid,'razorpay',p_account_id,p_event_id,p_event_type,p_transaction_id) ON CONFLICT DO NOTHING RETURNING id INTO event_row;
 IF event_row IS NULL THEN RETURN 'duplicate'; END IF;
 IF p_event_type='payout.processed' AND EXISTS(
  SELECT 1 FROM public.shop_payment_webhook_events
  WHERE merchant_id=mid AND event_type='payout.reversed'
  AND provider_transaction_id=p_transaction_id
 ) THEN RETURN 'ignored_after_reversal'; END IF;
 entry_kind:=CASE WHEN p_event_type IN('payment.captured','qr_code.credited','payout.reversed') THEN 'sale' ELSE 'expense' END;
 source_method:=CASE WHEN lower(coalesce(p_method,''))='upi' THEN 'UPI' WHEN lower(coalesce(p_method,'')) IN('bank','neft','imps','rtgs','netbanking','bank_transfer') THEN 'Bank' ELSE 'Other' END;
 reference_key:=CASE
 WHEN p_event_type IN ('payment.captured','qr_code.credited') THEN 'payment:'
 WHEN p_event_type='payout.processed' THEN 'payout:'
 WHEN p_event_type='payout.reversed' THEN 'payout_reversed:'
 ELSE 'refund:' END || p_transaction_id;
 -- A payout reversal is a *returned payout*, not new sales. Record as an offset
 -- only if we recorded the original payout; otherwise return 'unmatched_reversal'.
 IF p_event_type='payout.reversed' AND NOT EXISTS(
 SELECT 1 FROM public.shop_entries WHERE merchant_id=mid AND source='provider'
 AND provider='razorpay' AND provider_reference='payout:'||p_transaction_id)
 THEN RETURN 'unmatched_reversal'; END IF;
 INSERT INTO public.shop_entries(merchant_id,entry_date,kind,payment_method,amount,note,source,provider,provider_reference,payment_verified_at)
 VALUES(mid,(p_timestamp AT TIME ZONE 'Asia/Kolkata')::date,entry_kind,source_method,p_amount_paise::numeric/100,
 CASE p_event_type WHEN 'payment.captured' THEN 'Razorpay payment received'
 WHEN 'qr_code.credited' THEN 'Razorpay QR payment'
 WHEN 'payout.processed' THEN 'RazorpayX payout processed'
 WHEN 'payout.reversed' THEN 'RazorpayX payout reversal (returned funds)'
 ELSE 'Razorpay refund processed' END,
 'provider','razorpay',reference_key,now())
 ON CONFLICT DO NOTHING RETURNING id INTO entry_id;
 IF entry_id IS NULL THEN RETURN 'already_booked'; END IF;
 -- Only auto-collapse exact *provider reference* matches in manual note.
 -- Equal amount and same date alone may correspond to DIFFERENT customers.
 SELECT count(*),(array_agg(id ORDER BY id))[1] INTO candidates,paired
 FROM public.shop_entries WHERE merchant_id=mid AND source='manual'
 AND matched_provider_entry_id IS NULL AND payment_method IN('UPI','Bank')
 AND kind=entry_kind AND entry_date=(p_timestamp AT TIME ZONE 'Asia/Kolkata')::date
 AND amount=p_amount_paise::numeric/100
 AND position(p_transaction_id IN note)>0;
 IF candidates=1 THEN
 UPDATE public.shop_entries SET matched_provider_entry_id=entry_id
 WHERE id=paired AND source='manual' AND matched_provider_entry_id IS NULL;
 END IF;
 RETURN 'recorded';
END $$;
REVOKE ALL ON FUNCTION public.ingest_verified_razorpay_event(text,text,text,text,bigint,timestamptz,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ingest_verified_razorpay_event(text,text,text,text,bigint,timestamptz,text) TO service_role;
