create function public.bootstrap_family(
  family_name_input text,
  child_name_input text,
  child_birth_date_input date,
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
  existing_member public.family_members%rowtype;
  existing_family public.families%rowtype;
  existing_child public.children%rowtype;
  created_family public.families%rowtype;
  created_member public.family_members%rowtype;
  created_child public.children%rowtype;
begin
  if current_user_id is null then
    raise exception 'bootstrap_family requires an authenticated user';
  end if;

  select *
  into existing_member
  from public.family_members
  where user_id = current_user_id
  order by created_at asc
  limit 1;

  if found then
    select *
    into existing_family
    from public.families
    where id = existing_member.family_id;

    select *
    into existing_child
    from public.children
    where family_id = existing_member.family_id
    order by created_at asc
    limit 1;

    if existing_child.id is null then
      raise exception 'existing remote family has no child';
    end if;

    return query
    select
      existing_family.id,
      existing_child.id,
      existing_member.id,
      existing_member.user_id,
      existing_family.name,
      existing_child.name,
      existing_child.birth_date,
      existing_member.name,
      existing_member.role;

    return;
  end if;

  insert into public.families (name, created_by)
  values (coalesce(nullif(trim(family_name_input), ''), '우리 가족'), current_user_id)
  returning * into created_family;

  insert into public.family_members (family_id, user_id, name, role)
  values (
    created_family.id,
    current_user_id,
    coalesce(nullif(trim(member_name_input), ''), '보호자'),
    'parent'
  )
  returning * into created_member;

  insert into public.children (family_id, name, birth_date)
  values (
    created_family.id,
    coalesce(nullif(trim(child_name_input), ''), '하루'),
    child_birth_date_input
  )
  returning * into created_child;

  return query
  select
    created_family.id,
    created_child.id,
    created_member.id,
    created_member.user_id,
    created_family.name,
    created_child.name,
    created_child.birth_date,
    created_member.name,
    created_member.role;
end;
$$;

revoke execute on function public.bootstrap_family(text, text, date, text) from public;
revoke execute on function public.bootstrap_family(text, text, date, text) from anon;
grant execute on function public.bootstrap_family(text, text, date, text) to authenticated;
