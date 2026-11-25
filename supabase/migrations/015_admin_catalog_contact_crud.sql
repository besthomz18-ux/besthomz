grant select, insert, update, delete
on table public.categories, public.subcategories, public.products,
         public.product_images, public.product_pricing, public.faqs
to authenticated;

grant select
on table public.profiles
to authenticated;

grant select, update, delete
on table public.contact_messages
to authenticated;

grant select
on table public.site_settings
to authenticated;

grant insert
on table public.contact_messages
to anon, authenticated;

drop policy if exists "contact_staff_delete" on public.contact_messages;
create policy "contact_staff_delete"
on public.contact_messages for delete
to authenticated
using (public.is_staff());
