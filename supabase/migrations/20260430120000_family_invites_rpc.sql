create table public.family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{8}$'),
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  accepted_at timestamptz null,
  accepted_by uuid null references auth.users(id) on delete set null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index family_invites_family_id_idx on public.family_invites(family_id);
create index family_invites_code_idx on public.family_invites(code);

create trigger family_invites_set_updated_at
before update on public.family_invites
for each row execute function public.set_updated_at();

alter table public.family_invites enable row level security;

grant select on public.family_invites to authenticated;
grant execute on function public.is_family_parent(uuid) to authenticated;

create policy "parents can read family invites"
on public.family_invites
for select
to authenticated
using (public.is_family_parent(family_id));

create function public.create_family_invite(
  family_id_input uuid
)
returns table (
  invite_id uuid,
  family_id uuid,
  code text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  generated_code text;
  created_invite public.family_invites%rowtype;
  attempt_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'create_family_invite requires an authenticated user';
  end if;

  if not public.is_family_parent(family_id_input) then
    raise exception 'create_family_invite requires parent role';
  end if;

  loop
    attempt_count := attempt_count + 1;
    generated_code := upper(
      substr(encode(extensions.gen_random_bytes(8), 'hex'), 1, 8)
    );

    begin
      insert into public.family_invites (
        family_id,
        code,
        created_by,
        expires_at
      )
      values (
        family_id_input,
        generated_code,
        current_user_id,
        now() + interval '7 days'
      )
      returning * into created_invite;

      exit;
    exception
      when unique_violation then
        if attempt_count >= 5 then
          raise;
        end if;
    end;
  end loop;

  return query
  select
    created_invite.id,
    created_invite.family_id,
    created_invite.code,
    created_invite.expires_at;
end;
$$;

create function public.accept_family_invite(
  invite_code_input text,
  member_name_input text
)
returns table (
  remote_family_id uuid,
  remote_child_id uuid,
  remote_member_id uuid,
  remote_user_id uuid,
  family_name text,
  child_name text,
  child_birth_date date,
  member_name text,
  member_role text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_code text := upper(trim(invite_code_input));
  invite public.family_invites%rowtype;
  target_family public.families%rowtype;
  target_child public.children%rowtype;
  existing_member public.family_members%rowtype;
  joined_member public.family_members%rowtype;
begin
  if current_user_id is null then
    raise exception 'accept_family_invite requires an authenticated user';
  end if;

  select *
  into invite
  from public.family_invites
  where code = normalized_code
    and revoked_at is null
    and accepted_at is null
    and expires_at > now()
  for update;

  if invite.id is null then
    raise exception 'invalid_family_invite';
  end if;

  select *
  into target_family
  from public.families
  where id = invite.family_id;

  select *
  into target_child
  from public.children
  where family_id = invite.family_id
  order by created_at asc
  limit 1;

  if target_child.id is null then
    raise exception 'invite family has no child';
  end if;

  select *
  into existing_member
  from public.family_members
  where family_id = invite.family_id
    and user_id = current_user_id;

  if existing_member.id is null then
    insert into public.family_members (
      family_id,
      user_id,
      name,
      role
    )
    values (
      invite.family_id,
      current_user_id,
      coalesce(nullif(trim(member_name_input), ''), '가족'),
      'family'
    )
    returning * into joined_member;
  else
    joined_member := existing_member;
  end if;

  update public.family_invites
  set
    accepted_at = now(),
    accepted_by = current_user_id
  where id = invite.id;

  return query
  select
    target_family.id,
    target_child.id,
    joined_member.id,
    joined_member.user_id,
    target_family.name,
    target_child.name,
    target_child.birth_date,
    joined_member.name,
    joined_member.role;
end;
$$;

revoke execute on function public.create_family_invite(uuid) from public;
revoke execute on function public.create_family_invite(uuid) from anon;
grant execute on function public.create_family_invite(uuid) to authenticated;

revoke execute on function public.accept_family_invite(text, text) from public;
revoke execute on function public.accept_family_invite(text, text) from anon;
grant execute on function public.accept_family_invite(text, text) to authenticated;
