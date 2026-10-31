CREATE TRIGGER audit_shop_payment_connections
 AFTER INSERT OR UPDATE OR DELETE ON public.shop_payment_connections
 FOR EACH ROW EXECUTE FUNCTION public.audit_shop_change();
CREATE TRIGGER audit_shop_payment_link_requests
 AFTER INSERT OR UPDATE OR DELETE ON public.shop_payment_link_requests
 FOR EACH ROW EXECUTE FUNCTION public.audit_shop_change();
CREATE TRIGGER audit_shop_payment_webhook_events
 AFTER INSERT OR UPDATE OR DELETE ON public.shop_payment_webhook_events
 FOR EACH ROW EXECUTE FUNCTION public.audit_shop_change();
