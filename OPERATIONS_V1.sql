
-- Ops suite: owner-scoped records, consent-based procurement, append-only audit.
ALTER TABLE public.merchants ADD CONSTRAINT merchants_user_auth_fkey
 FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.shop_entries ADD CONSTRAINT shop_entries_merchant_id_id_unique UNIQUE(merchant_id,id);
ALTER TABLE public.shop_stock ADD CONSTRAINT shop_stock_merchant_id_id_unique UNIQUE(merchant_id,id);

CREATE TABLE public.shop_reconciliation (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 merchant_id bigint NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
 fingerprint text NOT NULL CHECK(length(fingerprint) BETWEEN 20 AND 128),
 txn_date date NOT NULL,
 direction text NOT NULL CHECK(direction IN ('credit','debit')),
 amount numeric(12,2) NOT NULL CHECK(amount>0 AND amount<=100000000),
 reference text NOT NULL DEFAULT '' CHECK(length(reference)<=140),
 description text NOT NULL DEFAULT '' CHECK(length(description)<=240),
 source_label text NOT NULL DEFAULT 'Uploaded CSV' CHECK(length(source_label)<=100),
 matched_entry_id uuid,
 reviewed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(merchant_id,fingerprint),
 UNIQUE(merchant_id,matched_entry_id),
 FOREIGN KEY(merchant_id,matched_entry_id) REFERENCES public.shop_entries(merchant_id,id) ON DELETE SET NULL(matched_entry_id)
);
CREATE INDEX recon_recent_idx ON public.shop_reconciliation(merchant_id,txn_date DESC);

CREATE TABLE public.shop_stock_movements(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 merchant_id bigint NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
 stock_id uuid NOT NULL,
 moved_on date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Kolkata')::date,
 movement_kind text NOT NULL CHECK(movement_kind IN ('sold','restocked')),
 quantity numeric(12,2) NOT NULL CHECK(quantity>0 AND quantity<=1000000),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(merchant_id,stock_id) REFERENCES public.shop_stock(merchant_id,id) ON DELETE CASCADE
);
CREATE INDEX stock_mov_recent_idx ON public.shop_stock_movements(merchant_id,stock_id,moved_on DESC);

-- Campaigns: public-to-nearby *within the signed-in merchant's own city*, not public to the internet.
CREATE TABLE public.mohalla_campaigns(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 merchant_id bigint NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
 item_name text NOT NULL CHECK(length(trim(item_name)) BETWEEN 2 AND 80),
 unit text NOT NULL CHECK(unit IN ('packs','boxes','kg','litres','pcs')),
 city text NOT NULL, state text NOT NULL,
 target_quantity numeric(12,2) NOT NULL CHECK(target_quantity>0 AND target_quantity<=1000000),
 closes_on date NOT NULL CHECK(closes_on<=current_date+interval '90 days'),
 description text NOT NULL DEFAULT '' CHECK(length(description)<=180),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(merchant_id,id)
);
CREATE INDEX mohalla_city_idx ON public.mohalla_campaigns(state,city,closes_on);
CREATE TABLE public.mohalla_pledges(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 campaign_id uuid NOT NULL REFERENCES public.mohalla_campaigns(id) ON DELETE CASCADE,
 merchant_id bigint NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
 quantity numeric(12,2) NOT NULL CHECK(quantity>0 AND quantity<=100000),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(campaign_id,merchant_id)
);
CREATE INDEX mohalla_pledge_merchant_idx ON public.mohalla_pledges(merchant_id);

CREATE TABLE public.shop_audit(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 merchant_id bigint NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
 actor_id uuid,
 record_table text NOT NULL,
 record_id text NOT NULL,
 action text NOT NULL CHECK(action IN ('INSERT','UPDATE','DELETE')),
 occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX shop_audit_owner_idx ON public.shop_audit(merchant_id,occurred_at DESC);
ALTER TABLE public.shop_reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mohalla_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mohalla_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.shop_reconciliation,public.shop_stock_movements,public.mohalla_campaigns,public.mohalla_pledges,public.shop_audit FROM anon,authenticated;
GRANT SELECT,INSERT ON public.shop_reconciliation TO authenticated;
GRANT SELECT ON public.shop_stock_movements TO authenticated;
GRANT SELECT,INSERT ON public.mohalla_campaigns TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.mohalla_pledges TO authenticated;
GRANT SELECT ON public.shop_audit TO authenticated;

CREATE POLICY "owner recon read" ON public.shop_reconciliation FOR SELECT TO authenticated
 USING(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));
CREATE POLICY "owner recon import" ON public.shop_reconciliation FOR INSERT TO authenticated
 WITH CHECK(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())) AND matched_entry_id IS NULL AND reviewed_at IS NULL);
CREATE POLICY "owner movement read" ON public.shop_stock_movements FOR SELECT TO authenticated
 USING(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));
CREATE POLICY "campaign region read" ON public.mohalla_campaigns FOR SELECT TO authenticated USING(
 EXISTS(SELECT 1 FROM public.merchants m WHERE m.user_id=(SELECT auth.uid())
  AND lower(trim(m.city))=lower(trim(mohalla_campaigns.city))
  AND lower(trim(m.state))=lower(trim(mohalla_campaigns.state))
  AND trim(m.city)<>'' AND trim(m.state)<>''));
CREATE POLICY "campaign create" ON public.mohalla_campaigns FOR INSERT TO authenticated WITH CHECK(
 merchant_id IN(SELECT id FROM public.merchants m WHERE m.user_id=(SELECT auth.uid())
  AND lower(trim(m.city))=lower(trim(mohalla_campaigns.city))
  AND lower(trim(m.state))=lower(trim(mohalla_campaigns.state))
  AND trim(m.city)<>'' AND trim(m.state)<>'') AND closes_on>=current_date);
CREATE POLICY "pledge mine read" ON public.mohalla_pledges FOR SELECT TO authenticated
 USING(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));
CREATE POLICY "pledge mine create" ON public.mohalla_pledges FOR INSERT TO authenticated WITH CHECK(
 merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())) AND
 EXISTS(SELECT 1 FROM public.mohalla_campaigns c
 WHERE c.id=mohalla_pledges.campaign_id AND c.closes_on>=current_date
 AND EXISTS(SELECT 1 FROM public.merchants m WHERE m.id=mohalla_pledges.merchant_id
 AND lower(trim(c.city))=lower(trim(m.city)) AND lower(trim(c.state))=lower(trim(m.state)))));
CREATE POLICY "pledge mine edit" ON public.mohalla_pledges FOR UPDATE TO authenticated
 USING(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())))
 WITH CHECK(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid()))
 AND EXISTS(SELECT 1 FROM public.mohalla_campaigns c WHERE c.id=mohalla_pledges.campaign_id AND c.closes_on>=current_date));
CREATE POLICY "pledge mine delete" ON public.mohalla_pledges FOR DELETE TO authenticated
 USING(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));
CREATE POLICY "audit owner read" ON public.shop_audit FOR SELECT TO authenticated
 USING(merchant_id IN(SELECT id FROM public.merchants WHERE user_id=(SELECT auth.uid())));

-- Audit captures events, NOT entire financial records/phone numbers.
CREATE OR REPLACE FUNCTION public.audit_shop_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE row_data record;
BEGIN
 IF TG_OP='DELETE' THEN row_data:=OLD; ELSE row_data:=NEW; END IF;
 INSERT INTO public.shop_audit(merchant_id,actor_id,record_table,record_id,action)
 VALUES(row_data.merchant_id,(SELECT auth.uid()),TG_TABLE_NAME,row_data.id::text,TG_OP);
 RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.audit_shop_change() FROM PUBLIC,anon,authenticated;
DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['shop_contacts','shop_dues','shop_stock','shop_entries','shop_reconciliation','shop_stock_movements','mohalla_campaigns','mohalla_pledges']
 LOOP
 EXECUTE format('CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_shop_change()',t,t);
 END LOOP;
END $$;

-- SQL aggregate returns totals only when at least five distinct shops have joined.
CREATE OR REPLACE FUNCTION public.get_mohalla_progress(p_campaign_id uuid)
RETURNS TABLE(participants bigint,pledged_total numeric,target_quantity numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT CASE WHEN count(*)>=5 THEN count(*) ELSE NULL::bigint END,
        CASE WHEN count(*)>=5 THEN sum(p.quantity) ELSE NULL::numeric END,
        max(c.target_quantity)
 FROM public.mohalla_campaigns c
 JOIN public.mohalla_pledges p ON p.campaign_id=c.id
 WHERE c.id=p_campaign_id AND EXISTS(
 SELECT 1 FROM public.merchants m WHERE m.user_id=(SELECT auth.uid())
 AND lower(trim(m.city))=lower(trim(c.city))
 AND lower(trim(m.state))=lower(trim(c.state))
 AND trim(m.city)<>'' AND trim(m.state)<>'')
 GROUP BY c.id;
$$;
REVOKE ALL ON FUNCTION public.get_mohalla_progress(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_mohalla_progress(uuid) TO authenticated;

-- SECURITY DEFINER RPC: verifies ownership and matches only one distinct, same-day, exact amount & direction payment.
CREATE OR REPLACE FUNCTION public.review_statement_match(p_statement_id uuid,p_entry_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE s public.shop_reconciliation%ROWTYPE; e public.shop_entries%ROWTYPE; m bigint;
BEGIN
 SELECT id INTO m FROM public.merchants WHERE user_id=(SELECT auth.uid()) LIMIT 1;
 IF m IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 SELECT * INTO s FROM public.shop_reconciliation WHERE id=p_statement_id AND merchant_id=m FOR UPDATE;
 SELECT * INTO e FROM public.shop_entries WHERE id=p_entry_id AND merchant_id=m FOR UPDATE;
 IF s.id IS NULL OR e.id IS NULL THEN RAISE EXCEPTION 'Record not found'; END IF;
 IF s.matched_entry_id IS NOT NULL THEN RAISE EXCEPTION 'Already reviewed'; END IF;
 IF e.payment_method NOT IN ('UPI','Bank') OR abs((s.txn_date-e.entry_date))>2
 OR round(s.amount,2)<>round(e.amount,2)
 OR (s.direction='credit' AND e.kind<>'sale')
 OR (s.direction='debit' AND e.kind<>'expense') THEN RAISE EXCEPTION 'Amount, date or direction do not agree'; END IF;
 UPDATE public.shop_reconciliation SET matched_entry_id=e.id,reviewed_at=now() WHERE id=s.id;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.review_statement_match(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.review_statement_match(uuid,uuid) TO authenticated;

-- Atomic sale/restock history and stock count, verified against current merchant.
CREATE OR REPLACE FUNCTION public.record_stock_activity(p_stock_id uuid,p_kind text,p_quantity numeric)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE row_data public.shop_stock%ROWTYPE; m bigint;
BEGIN
 IF p_kind NOT IN('sold','restocked') OR p_quantity IS NULL OR p_quantity<=0 OR p_quantity>100000 THEN RAISE EXCEPTION 'Invalid stock movement'; END IF;
 SELECT id INTO m FROM public.merchants WHERE user_id=(SELECT auth.uid()) LIMIT 1;
 IF m IS NULL THEN RAISE EXCEPTION 'Shop not found'; END IF;
 SELECT * INTO row_data FROM public.shop_stock WHERE id=p_stock_id AND merchant_id=m FOR UPDATE;
 IF row_data.id IS NULL THEN RAISE EXCEPTION 'Stock not found'; END IF;
 IF p_kind='sold' AND row_data.quantity<p_quantity THEN RAISE EXCEPTION 'Not enough recorded stock'; END IF;
 UPDATE public.shop_stock SET quantity=quantity+(CASE WHEN p_kind='sold' THEN -p_quantity ELSE p_quantity END),updated_at=now() WHERE id=p_stock_id;
 INSERT INTO public.shop_stock_movements(merchant_id,stock_id,movement_kind,quantity) VALUES(m,p_stock_id,p_kind,p_quantity);
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.record_stock_activity(uuid,text,numeric) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_stock_activity(uuid,text,numeric) TO authenticated;
