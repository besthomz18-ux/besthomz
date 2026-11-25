grant select, insert, update
on table public.quote_requests
to service_role;

grant select, insert
on table public.quote_items
to service_role;

grant usage, select
on sequence public.quote_number_seq
to service_role;

grant select, insert, update
on table public.profiles
to service_role;

grant select
on table public.profiles
to authenticated;

grant select, update
on table public.quote_requests
to authenticated;

grant select, update
on table public.quote_items
to authenticated;

grant select
on table public.quote_status_history
to authenticated;
