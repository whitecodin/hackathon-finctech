alter table public.shop_dues drop constraint shop_dues_merchant_id_contact_id_fkey;
alter table public.shop_dues add constraint shop_dues_merchant_id_contact_id_fkey
 foreign key(merchant_id,contact_id)
 references public.shop_contacts(merchant_id,id) on delete restrict;