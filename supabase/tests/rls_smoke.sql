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

rollback;
