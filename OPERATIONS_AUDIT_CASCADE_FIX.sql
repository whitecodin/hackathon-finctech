
-- Cascaded account deletion can remove child tables after their parent merchant
-- is already gone. In that case we must not insert an orphan audit event.
CREATE OR REPLACE FUNCTION public.audit_shop_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE row_data record;
BEGIN
 IF TG_OP='DELETE' THEN row_data:=OLD; ELSE row_data:=NEW; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.merchants WHERE id=row_data.merchant_id) THEN
   RETURN NULL;
 END IF;
 INSERT INTO public.shop_audit(merchant_id,actor_id,record_table,record_id,action)
 VALUES(row_data.merchant_id,(SELECT auth.uid()),TG_TABLE_NAME,row_data.id::text,TG_OP);
 RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.audit_shop_change() FROM PUBLIC,anon,authenticated;
