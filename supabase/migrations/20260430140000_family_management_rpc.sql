drop policy if exists "parents can remove family members" on public.family_members;

create function public.cancel_family_invite(
  invite_id_input uuid
)
returns table (
  invite_id uuid,
  family_id uuid,
  code text,
  expires_at timestamptz,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_invite public.family_invites%rowtype;
begin
  if current_user_id is null then
    raise exception 'cancel_family_invite requires an authenticated user';
  end if;

  select *
  into target_invite
  from public.family_invites
  where id = invite_id_input
  for update;

  if target_invite.id is null then
    raise exception 'family_invite_not_found';
  end if;

  if not public.is_family_parent(target_invite.family_id) then
    raise exception 'cancel_family_invite requires parent role';
  end if;

  if target_invite.accepted_at is not null
    or target_invite.revoked_at is not null
    or target_invite.expires_at <= now()
  then
    raise exception 'family_invite_not_pending';
  end if;

  update public.family_invites
  set revoked_at = now()
  where id = target_invite.id
  returning * into target_invite;

  return query
  select
    target_invite.id,
    target_invite.family_id,
    target_invite.code,
    target_invite.expires_at,
    target_invite.accepted_at,
    target_invite.revoked_at,
    target_invite.created_at;
end;
$$;

create function public.remove_family_member(
  member_id_input uuid
)
returns table (
  id uuid,
  family_id uuid,
  user_id uuid,
  name text,
  role text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_member public.family_members%rowtype;
  remaining_parent_count integer;
begin
  if current_user_id is null then
    raise exception 'remove_family_member requires an authenticated user';
  end if;

  select *
  into target_member
  from public.family_members as member
  where member.id = member_id_input
  for update;

  if target_member.id is null then
    raise exception 'family_member_not_found';
  end if;

  if not public.is_family_parent(target_member.family_id) then
    raise exception 'remove_family_member requires parent role';
  end if;

  if target_member.user_id = current_user_id then
    raise exception 'cannot_remove_self';
  end if;

  if target_member.role = 'parent' then
    select count(*)
    into remaining_parent_count
    from public.family_members as member
    where member.family_id = target_member.family_id
      and member.role = 'parent'
      and member.id <> target_member.id;

    if remaining_parent_count < 1 then
      raise exception 'cannot_remove_last_parent';
    end if;
  end if;

  delete from public.family_members
  where family_members.id = target_member.id;

  return query
  select
    target_member.id,
    target_member.family_id,
    target_member.user_id,
    target_member.name,
    target_member.role;
end;
$$;

revoke execute on function public.cancel_family_invite(uuid) from public;
revoke execute on function public.cancel_family_invite(uuid) from anon;
grant execute on function public.cancel_family_invite(uuid) to authenticated;

revoke execute on function public.remove_family_member(uuid) from public;
revoke execute on function public.remove_family_member(uuid) from anon;
grant execute on function public.remove_family_member(uuid) to authenticated;
