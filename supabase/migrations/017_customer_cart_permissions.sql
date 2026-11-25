grant select, insert, update
on table public.carts
to authenticated;

grant select, insert, update, delete
on table public.cart_items
to authenticated;

grant select, insert, update, delete
on table public.carts, public.cart_items
to service_role;

grant select
on table public.categories, public.products, public.product_images, public.product_variants
to service_role;

grant select
on table public.product_variants
to authenticated;
