-- Merchant-scoped restock / stock-out learning events.
-- No public writes: event + inventory adjustment happens atomically in an owner-only RPC.
CREATE TABLE IF NOT EXISTS public.shop_stock_cycles(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 merchant_id bigint NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
 stock_id uuid NOT NULL REFERENCES public.shop_stock(id) ON DELETE CASCADE,
 event_type text NOT NULL CHECK(event_type IN('stockout','restocked')),
 quantity numeric,
 reported_on date NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Kolkata')::date),
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT stock_cycles_valid_quantity CHECK (
   (event_type='stockout' AND quantity IS NULL) OR
   (event_type='restocked' AND quantity>0 AND quantity<=100000)
 )
);
CREATE INDEX IF NOT EXISTS shop_stock_cycles_owner_item_date_idx
 ON public.shop_stock_cycles(merchant_id,stock_id,reported_on DESC,created_at DESC);
ALTER TABLE public.shop_stock_cycles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.shop_stock_cycles FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.shop_stock_cycles TO authenticated;
DROP POLICY IF EXISTS "read own stock cycles" ON public.shop_stock_cycles;
CREATE POLICY "read own stock cycles" ON public.shop_stock_cycles
 FOR SELECT TO authenticated
 USING(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));

CREATE OR REPLACE FUNCTION public.record_my_stock_checkpoint(
 p_stock_id uuid, p_event_type text, p_quantity numeric DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE mid bigint; owned public.shop_stock%ROWTYPE; last_type text; event_id uuid;
BEGIN
 IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF p_event_type NOT IN('stockout','restocked') OR p_event_type IS NULL THEN RAISE EXCEPTION 'Invalid stock event'; END IF;
 IF (p_event_type='stockout' AND p_quantity IS NOT NULL)
  OR (p_event_type='restocked' AND (p_quantity IS NULL OR p_quantity<=0 OR p_quantity>100000))
 THEN RAISE EXCEPTION 'Invalid stock quantity'; END IF;

 SELECT id INTO mid FROM public.merchants WHERE user_id=(SELECT auth.uid()) LIMIT 1;
 IF mid IS NULL THEN RAISE EXCEPTION 'Merchant not found'; END IF;
 SELECT * INTO owned FROM public.shop_stock WHERE id=p_stock_id AND merchant_id=mid FOR UPDATE;
 IF owned.id IS NULL THEN RAISE EXCEPTION 'Item not found in your shop'; END IF;
 SELECT event_type INTO last_type FROM public.shop_stock_cycles
 WHERE merchant_id=mid AND stock_id=p_stock_id
 ORDER BY created_at DESC,id DESC LIMIT 1;
 IF p_event_type='stockout' THEN
   IF last_type='stockout' THEN RAISE EXCEPTION 'Already marked finished; record the next restock first'; END IF;
   UPDATE public.shop_stock SET quantity=0,updated_at=now() WHERE id=owned.id;
 ELSE
   UPDATE public.shop_stock SET quantity=quantity+p_quantity,updated_at=now() WHERE id=owned.id;
   INSERT INTO public.shop_stock_movements(merchant_id,stock_id,movement_kind,quantity)
   VALUES(mid,p_stock_id,'restocked',p_quantity);
 END IF;
 INSERT INTO public.shop_stock_cycles(merchant_id,stock_id,event_type,quantity)
 VALUES(mid,p_stock_id,p_event_type,p_quantity) RETURNING id INTO event_id;
 RETURN event_id;
END $$;
REVOKE ALL ON FUNCTION public.record_my_stock_checkpoint(uuid,text,numeric) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_my_stock_checkpoint(uuid,text,numeric) TO authenticated;

-- Clearing one's records must clear observations as well, not preserve personalized behavior.
CREATE OR REPLACE FUNCTION public.clear_my_shop_records(p_confirmation text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE mid bigint;
BEGIN
 IF p_confirmation <> 'DELETE MY SHOP DATA' THEN RAISE EXCEPTION 'Confirmation phrase does not match'; END IF;
 SELECT id INTO mid FROM public.merchants WHERE user_id=(SELECT auth.uid()) LIMIT 1 FOR UPDATE;
 IF mid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 DELETE FROM public.shop_ai_usage WHERE merchant_id=mid;
 DELETE FROM public.shop_ai_daily_usage WHERE merchant_id=mid;
 DELETE FROM public.shop_payment_webhook_events WHERE merchant_id=mid;
 DELETE FROM public.shop_payment_connections WHERE merchant_id=mid;
 DELETE FROM public.shop_payment_link_requests WHERE merchant_id=mid;
 DELETE FROM public.shop_reconciliation WHERE merchant_id=mid;
 DELETE FROM public.shop_stock_cycles WHERE merchant_id=mid;
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
