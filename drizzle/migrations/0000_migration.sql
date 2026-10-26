create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- First signed-in user to claim becomes owner; afterwards nobody can claim.
create or replace function public.owner_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;
create or replace function public.claim_owner()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  perform pg_advisory_xact_lock(4242);
  if exists (select 1 from public.user_roles where role = 'admin') then return false; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin');
  return true;
end $$;
revoke execute on function public.claim_owner() from anon;
grant execute on function public.owner_exists() to anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name') on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.products (
  id text primary key,
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  category text not null,
  image text not null default 'grabs',
  tag text,
  in_stock boolean not null default true,
  stock integer,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public read" on public.products for select to anon, authenticated using (true);
create policy "admin insert products" on public.products for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admin update products" on public.products for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin delete products" on public.products for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  user_id uuid,
  customer_name text not null,
  phone text not null,
  pickup_time text not null,
  notes text,
  items jsonb not null,
  total numeric(10,2) not null default 0,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
grant insert on public.orders to anon;
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "anyone can place order" on public.orders for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy "own or admin read orders" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "admin update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Price items from products table, validate stock, decrement stock.
create or replace function public.price_order()
returns trigger language plpgsql security definer set search_path = public as $$
declare it jsonb; p record; q int; out_items jsonb := '[]'::jsonb; t numeric := 0;
begin
  if jsonb_typeof(new.items) <> 'array' or jsonb_array_length(new.items) = 0 then raise exception 'Order has no items'; end if;
  for it in select * from jsonb_array_elements(new.items) loop
    q := (it->>'qty')::int;
    if q is null or q < 1 or q > 50 then raise exception 'Invalid quantity'; end if;
    select * into p from public.products where id = it->>'id' for update;
    if not found then raise exception 'Unknown product'; end if;
    if not p.in_stock or (p.stock is not null and p.stock < q) then raise exception '% is sold out', p.name; end if;
    if p.stock is not null then
      update public.products set stock = stock - q, in_stock = (stock - q) > 0 where id = p.id;
    end if;
    out_items := out_items || jsonb_build_object('id', p.id, 'name', p.name, 'price', p.price, 'qty', q);
    t := t + p.price * q;
  end loop;
  new.items := out_items; new.total := t; new.status := 'new'; new.created_at := now();
  return new;
end $$;
create trigger orders_price before insert on public.orders for each row execute function public.price_order();

insert into public.products (id, name, price, category, image, tag, sort) values
('chicken-smash-burger','Chicken Smash Burger',35,'burgers','grill',null,1),
('chicken-burger-chips','Chicken Burger + Chips',60,'burgers','platter',null,2),
('burger-chips-drink','Burger + Chips & Drink',75,'burgers','platter',null,3),
('beef-smash-burger','Beef Smash Burger',45,'burgers','grill','Bestseller',4),
('beef-smash-burger-chips','Beef Smash Burger + Chips',75,'burgers','platter',null,5),
('sm-burger-chips-drink','SM Burger + Chips & Drink',85,'burgers','platter','Combo',6),
('quarter-chicken-chips','1/2 Chicken + Chips',60,'chicken','chicken',null,7),
('half-chicken-chips','Half Chicken + Chips',90,'chicken','chicken','Bestseller',8),
('full-chicken-large-chips','Full Chicken + Large Chips',160,'chicken','chicken','Family',9),
('full-chicken-chips-rolls','F Chicken & L Chips + 4 Rolls',185,'chicken','chicken','Family',10),
('shawarma-chicken-chips','Chicken Shawarma + Chips',60,'shawarma','wrap','Bestseller',11),
('shawarma-chicken-chips-drink','Chicken Shawarma + Chips & Drink',75,'shawarma','wrap',null,12),
('shawarma-beef-chips','Beef Shawarma + Chips',75,'shawarma','wrap',null,13),
('shawarma-beef-chips-drink','Beef Shawarma + Chips & Drink',85,'shawarma','wrap',null,14),
('hot-dog-chicken','Hot Dog Chicken',25,'grabs','grabs',null,15),
('hot-bun-beef','Hot Bun Beef',30,'grabs','grabs',null,16),
('small-chips','Small Chips',20,'grabs','grabs',null,17),
('large-chips','Large Chips',30,'grabs','grabs',null,18),
('meat-fries-small','Meat Fries Small',30,'grabs','grabs',null,19),
('meat-fries-large','Meat Fries Large',50,'grabs','grabs','Must try',20),
('cold-drink-small','Cold Drink Small',15,'grabs','grabs',null,21),
('cold-drink-large','Cold Drink Large',20,'grabs','grabs',null,22);