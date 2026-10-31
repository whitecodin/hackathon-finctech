
-- Authorised merchant payment notifications -> Hisaab. No UPI scraping, no client-side secrets.
ALTER TABLE public.shop_entries ADD COLUMN source text NOT NULL DEFAULT 'manual'
 CHECK(source IN ('manual','provider'));
ALTER TABLE public.shop_entries ADD COLUMN provider text;
ALTER TABLE public.shop_entries ADD COLUMN provider_reference text;
ALTER TABLE public.shop_entries ADD COLUMN payment_verified_at timestamptz;
ALTER TABLE public.shop_entries ADD COLUMN matched_provider_entry_id uuid;
CREATE UNIQUE INDEX shop_entries_provider_ref_unique ON public.shop_entries(merchant_id,provider,provider_reference) WHERE provider_reference IS NOT NULL;
CREATE UNIQUE INDEX shop_entries_manual_match_unique ON public.shop_entries(matched_provider_entry_id) WHERE matched_provider_entry_id IS NOT NULL;
ALTER TABLE public.shop_entries ADD CONSTRAINT shop_entries_manual_match_fk
 FOREIGN KEY(merchant_id,matched_provider_entry_id)
 REFERENCES public.shop_entries(merchant_id,id) ON DELETE SET NULL(matched_provider_entry_id);
ALTER TABLE public.shop_entries ADD CONSTRAINT shop_entries_source_truth
 CHECK ((source='manual' AND provider IS NULL AND provider_reference IS NULL AND payment_verified_at IS NULL)
 OR (source='provider' AND provider='razorpay' AND provider_reference IS NOT NULL AND payment_verified_at IS NOT NULL AND matched_provider_entry_id IS NULL));

DROP POLICY IF EXISTS "own shop_entries create" ON public.shop_entries;
DROP POLICY IF EXISTS "own shop_entries edit" ON public.shop_entries;
DROP POLICY IF EXISTS "own shop_entries delete" ON public.shop_entries;
CREATE POLICY "manual entries only create" ON public.shop_entries FOR INSERT TO authenticated
 WITH CHECK (source='manual' AND matched_provider_entry_id IS NULL AND
 merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));
CREATE POLICY "manual entries only edit" ON public.shop_entries FOR UPDATE TO authenticated
 USING (source='manual' AND merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())))
 WITH CHECK (source='manual' AND merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));
CREATE POLICY "manual entries only delete" ON public.shop_entries FOR DELETE TO authenticated
 USING (source='manual' AND merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));

CREATE TABLE public.shop_payment_link_requests(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 merchant_id bigint NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
 provider text NOT NULL CHECK (provider='razorpay'),
 account_hint text NOT NULL CHECK(length(trim(account_hint)) BETWEEN 6 AND 100),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(merchant_id,provider)
);
ALTER TABLE public.shop_payment_link_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.shop_payment_link_requests FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON public.shop_payment_link_requests TO authenticated;
CREATE POLICY "view own payment-link requests" ON public.shop_payment_link_requests
 FOR SELECT TO authenticated USING(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));
CREATE POLICY "request payment-link review" ON public.shop_payment_link_requests
 FOR INSERT TO authenticated WITH CHECK(status='pending' AND merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));

CREATE TABLE public.shop_payment_connections(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 merchant_id bigint NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
 provider text NOT NULL CHECK(provider='razorpay'),
 provider_account_id text NOT NULL CHECK(length(trim(provider_account_id)) BETWEEN 8 AND 100),
 status text NOT NULL CHECK(status IN('active','disconnected')),
 approved_at timestamptz NOT NULL DEFAULT now(),
 disconnected_at timestamptz,
 UNIQUE(provider,provider_account_id),
 UNIQUE(merchant_id,provider)
);
ALTER TABLE public.shop_payment_connections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.shop_payment_connections FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.shop_payment_connections TO authenticated;
CREATE POLICY "view own approved connections" ON public.shop_payment_connections
 FOR SELECT TO authenticated USING(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));

CREATE TABLE public.shop_payment_webhook_events(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 merchant_id bigint NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
 provider text NOT NULL,
 provider_account_id text NOT NULL,
 event_id text NOT NULL,
 event_type text NOT NULL,
 provider_transaction_id text NOT NULL,
 received_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(provider,provider_account_id,event_id)
);
ALTER TABLE public.shop_payment_webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.shop_payment_webhook_events FROM PUBLIC,anon,authenticated;

-- Owner can see the connection status but cannot approve it or forge verified transactions.
CREATE OR REPLACE FUNCTION public.disconnect_my_payment_provider(p_provider text DEFAULT 'razorpay')
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE mid bigint;
BEGIN
 SELECT id INTO mid FROM public.merchants WHERE user_id=(SELECT auth.uid()) LIMIT 1;
 IF mid IS NULL OR p_provider<>'razorpay' THEN RETURN false; END IF;
 UPDATE public.shop_payment_connections SET status='disconnected',disconnected_at=now()
 WHERE merchant_id=mid AND provider=p_provider AND status='active';
 RETURN FOUND;
END $$;
REVOKE ALL ON FUNCTION public.disconnect_my_payment_provider(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.disconnect_my_payment_provider(text) TO authenticated;

-- Service-only procedure called AFTER external HMAC has been verified by edge function.
-- A forged JSON body alone can never invoke this because anonymous/authenticated EXECUTE is revoked.
CREATE OR REPLACE FUNCTION public.ingest_verified_razorpay_event(
 p_account_id text,p_event_id text,p_event_type text,p_transaction_id text,
 p_amount_paise bigint,p_timestamp timestamptz,p_method text DEFAULT 'upi'
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE mid bigint; event_row bigint; entry_id uuid; entry_kind text; source_method text; paired uuid; candidates int;
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
 entry_kind:=CASE WHEN p_event_type IN('payment.captured','qr_code.credited','payout.reversed') THEN 'sale' ELSE 'expense' END;
 source_method:=CASE WHEN lower(coalesce(p_method,''))='upi' THEN 'UPI' ELSE 'Bank' END;
 -- payment.captured and qr_code.credited can refer to same transaction; unique id prevents double counting.
 INSERT INTO public.shop_entries(merchant_id,entry_date,kind,payment_method,amount,note,source,provider,provider_reference,payment_verified_at)
 VALUES(mid,(p_timestamp AT TIME ZONE 'Asia/Kolkata')::date,entry_kind,source_method,p_amount_paise::numeric/100,
 CASE p_event_type WHEN 'payment.captured' THEN 'Razorpay payment received'
 WHEN 'qr_code.credited' THEN 'Razorpay QR payment'
 WHEN 'payout.processed' THEN 'RazorpayX payout processed'
 WHEN 'payout.reversed' THEN 'RazorpayX payout reversal'
 ELSE 'Razorpay refund processed' END,
 'provider','razorpay',p_event_type||':'||p_transaction_id,now())
 ON CONFLICT DO NOTHING RETURNING id INTO entry_id;
 IF entry_id IS NULL THEN RETURN 'already_booked'; END IF;
 -- Reconciliation of manual entries only when the match is unique, same-day and identical amount.
 -- Leave ambiguous manual entries untouched for owner review.
 SELECT count(*),min(id) INTO candidates,paired FROM public.shop_entries
 WHERE merchant_id=mid AND source='manual' AND matched_provider_entry_id IS NULL
 AND payment_method IN('UPI','Bank') AND kind=entry_kind
 AND entry_date=(p_timestamp AT TIME ZONE 'Asia/Kolkata')::date
 AND amount=p_amount_paise::numeric/100;
 IF candidates=1 THEN
  UPDATE public.shop_entries SET matched_provider_entry_id=entry_id WHERE id=paired AND source='manual' AND matched_provider_entry_id IS NULL;
 END IF;
 RETURN 'recorded';
END $$;
REVOKE ALL ON FUNCTION public.ingest_verified_razorpay_event(text,text,text,text,bigint,timestamptz,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ingest_verified_razorpay_event(text,text,text,text,bigint,timestamptz,text) TO service_role;
