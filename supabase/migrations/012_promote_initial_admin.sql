do $$
declare
  target_id constant uuid := 'aeead9fb-1d22-470d-a65e-c5126db5013c';
begin
  if not exists (
    select 1
    from auth.users
    where id = target_id
      and lower(email) = lower('besthomzadmin@gmail.com')
  ) then
    raise exception 'The configured admin Auth user was not found.';
  end if;

  insert into public.profiles (id, email, role)
  select id, email, 'admin'
  from auth.users
  where id = target_id
  on conflict (id) do update
  set role = 'admin',
      updated_at = now();
end
$$;
