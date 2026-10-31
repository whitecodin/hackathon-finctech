-- VyaparTrust daily shop companion: explicitly recorded, merchant-owned data only.
create table if not exists public.shop_contacts (
 id uuid primary key default gen_random_uuid(),
 merchant_id bigint not null references public.merchants(id) on delete cascade,
 kind text not null check(kind in ('customer','supplier')),
 name text not null check(char_length(trim(name)) between 1 and 100),
 phone text check(phone is null or char_length(phone) between 7 and 18),
 repeat_items text not null default '' check(char_length(repeat_items)<=450),
 repeat_consent boolean not null default false,
 created_at timestamptz not null default now(),
 unique(merchant_id,id)
);
create table if not exists public.shop_dues (
 id uuid primary key default gen_random_uuid(),
 merchant_id bigint not null references public.merchants(id) on delete cascade,
 contact_id uuid not null,
 direction text not null check(direction in ('receive','pay')),
 amount numeric(12,2) not null check(amount>0 and amount<=100000000),
 settled numeric(12,2) not null default 0 check(settled>=0 and settled<=amount),
 due_date date,
 note text not null default '' check(char_length(note)<=240),
 created_at timestamptz not null default now(),
 foreign key(merchant_id,contact_id) references public.shop_contacts(merchant_id,id) on delete cascade
);
create table if not exists public.shop_stock (
 id uuid primary key default gen_random_uuid(),
 merchant_id bigint not null references public.merchants(id) on delete cascade,
 item_name text not null check(char_length(trim(item_name)) between 1 and 100),
 unit text not null default 'pcs' check(unit in ('pcs','kg','litres','packs','boxes')),
 quantity numeric(12,2) not null default 0 check(quantity>=0 and quantity<=10000000),
 reorder_at numeric(12,2) not null default 5 check(reorder_at>=0 and reorder_at<=10000000),
 last_cost numeric(12,2) check(last_cost is null or (last_cost>=0 and last_cost<=10000000)),
 updated_at timestamptz not null default now()
);
create table if not exists public.shop_entries (
 id uuid primary key default gen_random_uuid(),
 merchant_id bigint not null references public.merchants(id) on delete cascade,
 entry_date date not null default current_date,
 kind text not null check(kind in ('sale','expense')),
 payment_method text not null default 'Cash' check(payment_method in ('Cash','UPI','Bank','Other')),
 amount numeric(12,2) not null check(amount>0 and amount<=100000000),
 note text not null default '' check(char_length(note)<=240),
 created_at timestamptz not null default now()
);
create index if not exists shop_contacts_merchant_idx on public.shop_contacts(merchant_id,kind);
create index if not exists shop_dues_merchant_idx on public.shop_dues(merchant_id,due_date);
create index if not exists shop_stock_merchant_idx on public.shop_stock(merchant_id,item_name);
create index if not exists shop_entries_merchant_idx on public.shop_entries(merchant_id,entry_date desc);
alter table public.shop_contacts enable row level security;
alter table public.shop_dues enable row level security;
alter table public.shop_stock enable row level security;
alter table public.shop_entries enable row level security;
revoke all on public.shop_contacts,public.shop_dues,public.shop_stock,public.shop_entries from anon,authenticated;
grant select,insert,update,delete on public.shop_contacts,public.shop_dues,public.shop_stock,public.shop_entries to authenticated;
-- A shopkeeper owns records only where the linked shop belongs to their authenticated identity.
do $$
declare t text;
begin
 for t in select unnest(array['shop_contacts','shop_dues','shop_stock','shop_entries'])
 loop
  execute format('drop policy if exists "own %s read" on public.%I',t,t);
  execute format('drop policy if exists "own %s create" on public.%I',t,t);
  execute format('drop policy if exists "own %s edit" on public.%I',t,t);
  execute format('drop policy if exists "own %s delete" on public.%I',t,t);
  execute format('create policy "own %s read" on public.%I for select to authenticated using (merchant_id in (select id from public.merchants where user_id = (select auth.uid())))',t,t);
  execute format('create policy "own %s create" on public.%I for insert to authenticated with check (merchant_id in (select id from public.merchants where user_id = (select auth.uid())))',t,t);
  execute format('create policy "own %s edit" on public.%I for update to authenticated using (merchant_id in (select id from public.merchants where user_id = (select auth.uid()))) with check (merchant_id in (select id from public.merchants where user_id = (select auth.uid())))',t,t);
  execute format('create policy "own %s delete" on public.%I for delete to authenticated using (merchant_id in (select id from public.merchants where user_id = (select auth.uid())))',t,t);
 end loop;
end $$;
