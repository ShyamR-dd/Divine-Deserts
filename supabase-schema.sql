create table if not exists public.products (
    id text primary key,
    name text not null,
    category text not null,
    price numeric not null default 0,
    unit text not null default '',
    image_url text not null,
    discount integer not null default 0,
    in_stock boolean not null default true,
    quote_only boolean not null default false,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

alter table public.products enable row level security;

create policy "Public can view products"
on public.products
for select
using (true);

create policy "Authenticated users can insert products"
on public.products
for insert
to authenticated
with check (true);

create policy "Authenticated users can update products"
on public.products
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete products"
on public.products
for delete
to authenticated
using (true);

insert into public.products (id, name, category, price, unit, image_url, discount, in_stock, quote_only, sort_order)
values
('cheese-cake', 'Cheese Cake', 'Cakes', 650, '/500g', 'cheesecake.jpg', 0, true, false, 1),
('cup-cakes-muffins', 'Cup Cakes & Muffins', 'Cakes', 50, '/piece', 'cupcakes.jpg', 0, true, false, 2),
('black-forest', 'Black Forest', 'Cakes', 650, '/500g', 'blackforest.jpg', 0, true, false, 3),
('chocolate-cake', 'Chocolate Cake', 'Cakes', 650, '/500g', 'chocolatecake.jpg', 0, true, false, 4),
('red-velvet-cake', 'Red Velvet Cake', 'Cakes', 900, '/500g', 'redvelvet.jpg', 0, true, false, 5),
('vanilla-cake', 'Vanilla Cake', 'Cakes', 550, '/500g', 'vanilla.jpg', 0, true, false, 6),
('brownies', 'Brownies', 'Brownies', 700, '/500g', 'brownies.jpg', 0, true, false, 7),
('korean-cheese-bun', 'Korean Cheese Bun', 'Buns', 90, '/piece', 'korean-cheesebun.jpg', 0, true, false, 8),
('donuts', 'Donuts', 'Desserts', 75, '/piece', 'donuts.jpg', 0, true, false, 9),
('custom-cakes', 'Custom Cakes', 'Custom Orders', 0, '', 'customcake.jpg', 0, true, true, 10),
('vanilla-chocolate-ice-cream', 'Vanilla Chocolate Ice Cream', 'Ice Cream', 210, '/250ml', 'vanillaice.jpg', 0, true, false, 11),
('death-by-chocolate', 'Death by Chocolate', 'Ice Cream', 375, '/250ml', 'deathbychoc.jpg', 0, true, false, 12),
('chocolate-hazelnut-butter', 'Chocolate Hazelnut Butter', 'Spreads', 500, '/250g', 'chochazelnut.jpg', 0, true, false, 13),
('cashew-chocolate-butter', 'Cashew Chocolate Butter', 'Spreads', 350, '/250g', 'cashewchoc.jpg', 0, true, false, 14),
('peanut-butter', 'Peanut Butter', 'Spreads', 200, '/250g', 'peanutbutter.jpg', 0, true, false, 15),
('osmania-biscuits', 'Osmania Biscuits', 'Biscuits', 150, '/200g', 'Osmania.jpg', 0, true, false, 16)
on conflict (id) do nothing;

-- Create a public storage bucket named product-images in Supabase Storage.
-- Then add these storage policies in the SQL editor:
-- create policy "Public can view product images" on storage.objects for select using (bucket_id = 'product-images');
-- create policy "Authenticated users can upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
-- create policy "Authenticated users can update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images') with check (bucket_id = 'product-images');
