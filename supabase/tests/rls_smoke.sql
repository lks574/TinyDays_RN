begin;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
values
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-parent@example.com',
    crypt('password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}'
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-family@example.com',
    crypt('password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}'
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-outsider@example.com',
    crypt('password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}'
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-bootstrap@example.com',
    crypt('password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}'
  ),
  (
    '00000000-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-second-parent@example.com',
    crypt('password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}'
  );

insert into public.families (id, name, created_by)
values (
  '10000000-0000-0000-0000-000000000011',
  'RLS 가족',
  '00000000-0000-0000-0000-000000000011'
);

insert into public.family_members (id, family_id, user_id, name, role)
values
  (
    '20000000-0000-0000-0000-000000000011',
    '10000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000011',
    '보호자',
    'parent'
  ),
  (
    '20000000-0000-0000-0000-000000000012',
    '10000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000012',
    '가족',
    'family'
  );

insert into public.children (id, family_id, name, birth_date)
values (
  '30000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000011',
  '하루',
  '2025-12-30'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000011',
  true
);

insert into public.baby_logs (
  id,
  family_id,
  child_id,
  created_by,
  log_type,
  recorded_at,
  amount,
  unit,
  source,
  confidence
)
values (
  '40000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000011',
  '30000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000011',
  'feeding',
  now(),
  120,
  'ml',
  'quick_button',
  1
);

insert into public.media_assets (
  id,
  family_id,
  child_id,
  created_by,
  asset_type,
  bucket,
  object_key,
  status,
  file_name,
  mime_type
)
values (
  '50000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000011',
  '30000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000011',
  'photo',
  'tinydays-private-media',
  'families/10000000-0000-0000-0000-000000000011/photos/example.jpg',
  'uploaded',
  'example.jpg',
  'image/jpeg'
);

update public.baby_logs
set memo = '보호자가 수정한 기록'
where id = '40000000-0000-0000-0000-000000000011';

update public.media_assets
set status = 'uploaded'
where id = '50000000-0000-0000-0000-000000000011';

do $$
declare
  actual_count integer;
begin
  select count(*) into actual_count from public.baby_logs;

  if actual_count != 1 then
    raise exception 'parent should read one baby_log, got %', actual_count;
  end if;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000012',
  true
);

do $$
declare
  actual_count integer;
begin
  select count(*) into actual_count from public.baby_logs;

  if actual_count != 1 then
    raise exception 'family member should read one baby_log, got %', actual_count;
  end if;
end;
$$;

do $$
begin
  insert into public.baby_logs (
    family_id,
    child_id,
    created_by,
    log_type,
    recorded_at,
    source
  )
  values (
    '10000000-0000-0000-0000-000000000011',
    '30000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000012',
    'memo',
    now(),
    'manual'
  );

  raise exception 'family role should not insert baby_logs';
exception
  when insufficient_privilege or check_violation or with_check_option_violation then
    null;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000013',
  true
);

do $$
declare
  actual_count integer;
begin
  select count(*) into actual_count from public.baby_logs;

  if actual_count != 0 then
    raise exception 'outsider should not read baby_logs, got %', actual_count;
  end if;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000011',
  true
);

create temporary table invite_result as
select *
from public.create_family_invite(
  '10000000-0000-0000-0000-000000000011'
);

create temporary table cancel_invite_result as
select *
from public.create_family_invite(
  '10000000-0000-0000-0000-000000000011'
);

do $$
declare
  invite_count integer;
begin
  select count(*) into invite_count from invite_result;

  if invite_count != 1 then
    raise exception 'parent should create one family invite';
  end if;
end;
$$;

do $$
declare
  canceled_result record;
begin
  select *
  into canceled_result
  from public.cancel_family_invite(
    (select invite_id from cancel_invite_result limit 1)
  );

  if canceled_result.revoked_at is null then
    raise exception 'parent should cancel pending family invite';
  end if;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000012',
  true
);

do $$
begin
  perform public.create_family_invite(
    '10000000-0000-0000-0000-000000000011'
  );

  raise exception 'family role should not create family invites';
exception
  when insufficient_privilege or check_violation or raise_exception then
    null;
end;
$$;

do $$
declare
  did_fail boolean := false;
begin
  begin
    perform public.cancel_family_invite(
      (select invite_id from invite_result limit 1)
    );
  exception
    when insufficient_privilege or check_violation or raise_exception then
      did_fail := true;
  end;

  if not did_fail then
    raise exception 'family role should not cancel family invites';
  end if;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000013',
  true
);

do $$
declare
  accepted_result record;
  actual_count integer;
begin
  begin
    actual_count := 0;
  end;

  begin
    perform public.accept_family_invite(
      (select code from cancel_invite_result limit 1),
      '취소 초대'
    );
  exception
    when insufficient_privilege or check_violation or raise_exception then
      actual_count := 1;
  end;

  if actual_count != 1 then
    raise exception 'canceled invite should not be accepted';
  end if;

  select *
  into accepted_result
  from public.accept_family_invite(
    (select code from invite_result limit 1),
    '초대 가족'
  );

  if accepted_result.remote_user_id != '00000000-0000-0000-0000-000000000013' then
    raise exception 'invite should use auth uid as remote user';
  end if;

  if accepted_result.member_role != 'family' then
    raise exception 'accepted invite member should be family';
  end if;

  select count(*) into actual_count
  from public.family_members
  where family_id = '10000000-0000-0000-0000-000000000011'
    and user_id = '00000000-0000-0000-0000-000000000013'
    and role = 'family';

  if actual_count != 1 then
    raise exception 'invite should create one family member';
  end if;

  select count(*) into actual_count from public.baby_logs;

  if actual_count != 1 then
    raise exception 'accepted invite member should read baby_logs, got %', actual_count;
  end if;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000011',
  true
);

insert into public.family_members (family_id, user_id, name, role)
values (
  '10000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000015',
  '두 번째 보호자',
  'parent'
);

do $$
declare
  actual_count integer;
begin
  delete from public.family_members
  where id = '20000000-0000-0000-0000-000000000012';

  select count(*) into actual_count
  from public.family_members
  where id = '20000000-0000-0000-0000-000000000012';

  if actual_count != 1 then
    raise exception 'direct family_members delete should be blocked';
  end if;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000015',
  true
);

insert into public.baby_logs (
  id,
  family_id,
  child_id,
  created_by,
  log_type,
  recorded_at,
  source,
  confidence
)
values (
  '40000000-0000-0000-0000-000000000015',
  '10000000-0000-0000-0000-000000000011',
  '30000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000015',
  'memo',
  now(),
  'manual',
  1
);

insert into public.media_assets (
  id,
  family_id,
  child_id,
  created_by,
  asset_type,
  bucket,
  object_key,
  status,
  file_name,
  mime_type
)
values (
  '50000000-0000-0000-0000-000000000015',
  '10000000-0000-0000-0000-000000000011',
  '30000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000015',
  'photo',
  'tinydays-private-media',
  'families/10000000-0000-0000-0000-000000000011/photos/second-parent.jpg',
  'uploaded',
  'second-parent.jpg',
  'image/jpeg'
);

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000011',
  true
);

do $$
declare
  removed_result record;
  actual_count integer;
begin
  select *
  into removed_result
  from public.remove_family_member(
    (
      select id
      from public.family_members
      where user_id = '00000000-0000-0000-0000-000000000012'
        and family_id = '10000000-0000-0000-0000-000000000011'
    )
  );

  if removed_result.user_id != '00000000-0000-0000-0000-000000000012' then
    raise exception 'remove_family_member should return removed member';
  end if;

  select count(*) into actual_count
  from public.family_members
  where user_id = '00000000-0000-0000-0000-000000000012'
    and family_id = '10000000-0000-0000-0000-000000000011';

  if actual_count != 0 then
    raise exception 'removed family member should lose membership';
  end if;
end;
$$;

do $$
declare
  did_fail boolean := false;
begin
  begin
    perform public.remove_family_member(
      (
        select id
        from public.family_members
        where user_id = '00000000-0000-0000-0000-000000000011'
          and family_id = '10000000-0000-0000-0000-000000000011'
      )
    );
  exception
    when insufficient_privilege or check_violation or raise_exception then
      did_fail := true;
  end;

  if not did_fail then
    raise exception 'self removal should be blocked';
  end if;
end;
$$;

do $$
declare
  actual_count integer;
begin
  perform public.remove_family_member(
    (
      select id
      from public.family_members
      where user_id = '00000000-0000-0000-0000-000000000015'
        and family_id = '10000000-0000-0000-0000-000000000011'
    )
  );

  select count(*) into actual_count
  from public.baby_logs
  where created_by = '00000000-0000-0000-0000-000000000015';

  if actual_count != 1 then
    raise exception 'removed member baby_logs should be preserved';
  end if;

  select count(*) into actual_count
  from public.media_assets
  where created_by = '00000000-0000-0000-0000-000000000015';

  if actual_count != 1 then
    raise exception 'removed member media_assets should be preserved';
  end if;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000012',
  true
);

do $$
declare
  actual_count integer;
begin
  select count(*) into actual_count from public.baby_logs;

  if actual_count != 0 then
    raise exception 'removed family member should not read baby_logs, got %', actual_count;
  end if;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000014',
  true
);

do $$
declare
  bootstrap_result record;
  family_count integer;
  member_count integer;
  child_count integer;
begin
  select *
  into bootstrap_result
  from public.bootstrap_family(
    '부트스트랩 가족',
    '새아기',
    '2026-01-02',
    '새 보호자'
  );

  if bootstrap_result.remote_user_id != '00000000-0000-0000-0000-000000000014' then
    raise exception 'bootstrap should use auth uid as remote user';
  end if;

  if bootstrap_result.member_role != 'parent' then
    raise exception 'bootstrap member should be parent';
  end if;

  select count(*) into family_count
  from public.families
  where created_by = '00000000-0000-0000-0000-000000000014';

  select count(*) into member_count
  from public.family_members
  where user_id = '00000000-0000-0000-0000-000000000014'
    and role = 'parent';

  select count(*) into child_count
  from public.children
  where family_id = bootstrap_result.remote_family_id;

  if family_count != 1 or member_count != 1 or child_count != 1 then
    raise exception 'bootstrap should create one family/member/child';
  end if;

  perform public.bootstrap_family(
    '중복 가족',
    '중복 아기',
    null,
    '중복 보호자'
  );

  select count(*) into family_count
  from public.families
  where created_by = '00000000-0000-0000-0000-000000000014';

  if family_count != 1 then
    raise exception 'bootstrap should not create duplicate families';
  end if;
end;
$$;

rollback;
