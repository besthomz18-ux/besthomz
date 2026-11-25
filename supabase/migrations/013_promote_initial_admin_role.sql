do $$
declare
  target_id constant uuid := 'aeead9fb-1d22-470d-a65e-c5126db5013c';
  privilege_trigger_disabled boolean := false;
begin
  if not exists (
    select 1
    from auth.users
    where id = target_id
      and lower(email) = lower('besthomzadmin@gmail.com')
  ) then
    raise exception 'The configured admin Auth user was not found.';
  end if;

  if exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.profiles'::regclass
      and tgname = 'profiles_prevent_privilege_escalation'
      and not tgisinternal
  ) then
    execute 'alter table public.profiles disable trigger profiles_prevent_privilege_escalation';
    privilege_trigger_disabled := true;
  end if;

  begin
    insert into public.profiles (id, email, role)
    select id, email, 'admin'
    from auth.users
    where id = target_id
    on conflict (id) do update
    set role = 'admin',
        updated_at = now();
  exception when others then
    if privilege_trigger_disabled then
      execute 'alter table public.profiles enable trigger profiles_prevent_privilege_escalation';
    end if;
    raise;
  end;

  if privilege_trigger_disabled then
    execute 'alter table public.profiles enable trigger profiles_prevent_privilege_escalation';
  end if;
end
$$;
