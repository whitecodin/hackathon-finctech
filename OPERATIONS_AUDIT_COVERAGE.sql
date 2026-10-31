
-- Existing business data also participates in the append-only audit timeline.
CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON public.transactions
 FOR EACH ROW EXECUTE FUNCTION public.audit_shop_change();

CREATE OR REPLACE FUNCTION public.audit_merchant_identity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE m bigint;
BEGIN
 m:=CASE WHEN TG_OP='DELETE' THEN OLD.id ELSE NEW.id END;
 IF NOT EXISTS(SELECT 1 FROM public.merchants WHERE id=m) THEN RETURN NULL; END IF;
 INSERT INTO public.shop_audit(merchant_id,actor_id,record_table,record_id,action)
 VALUES(m,(SELECT auth.uid()),'merchants',m::text,TG_OP);
 RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.audit_merchant_identity() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER audit_merchants AFTER INSERT OR UPDATE OR DELETE ON public.merchants
 FOR EACH ROW EXECUTE FUNCTION public.audit_merchant_identity();

CREATE OR REPLACE FUNCTION public.audit_league_preference() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE m bigint;
BEGIN
 m:=CASE WHEN TG_OP='DELETE' THEN OLD.merchant_id ELSE NEW.merchant_id END;
 IF NOT EXISTS(SELECT 1 FROM public.merchants WHERE id=m) THEN RETURN NULL; END IF;
 INSERT INTO public.shop_audit(merchant_id,actor_id,record_table,record_id,action)
 VALUES(m,(SELECT auth.uid()),'merchant_league_preferences',m::text,TG_OP);
 RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.audit_league_preference() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER audit_merchant_league_preferences AFTER INSERT OR UPDATE OR DELETE ON public.merchant_league_preferences
 FOR EACH ROW EXECUTE FUNCTION public.audit_league_preference();
