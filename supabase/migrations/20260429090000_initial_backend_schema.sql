create extension if not exists "pgcrypto";

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  role text not null check (role in ('parent', 'family')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  birth_date date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, family_id)
);

create table public.baby_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  log_type text not null check (
    log_type in (
      'feeding',
      'sleep_start',
      'sleep_end',
      'diaper_pee',
      'diaper_poop',
      'vitamin',
      'medicine',
      'temperature',
      'bath',
      'memo',
      'unknown'
    )
  ),
  recorded_at timestamptz not null,
  amount numeric null,
  unit text null,
  memo text null,
  source text not null check (
    source in ('manual', 'quick_button', 'voice', 'siri', 'imported')
  ),
  original_text text null,
  confidence numeric not null default 1 check (confidence >= 0 and confidence <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (child_id, family_id) references public.children(id, family_id) on delete cascade
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  asset_type text not null check (asset_type in ('photo', 'video', 'thumbnail')),
  storage_provider text not null default 'r2' check (storage_provider in ('r2')),
  bucket text not null check (length(trim(bucket)) > 0),
  object_key text not null check (length(trim(object_key)) > 0),
  status text not null default 'draft' check (
    status in ('draft', 'uploading', 'uploaded', 'failed', 'deleted')
  ),
  file_name text null,
  file_size bigint null check (file_size is null or file_size >= 0),
  mime_type text null,
  width integer null check (width is null or width > 0),
  height integer null check (height is null or height > 0),
  captured_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, object_key),
  foreign key (child_id, family_id) references public.children(id, family_id) on delete cascade
);

create index families_created_by_idx on public.families(created_by);
create index family_members_user_id_idx on public.family_members(user_id);
create index family_members_family_id_idx on public.family_members(family_id);
create index children_family_id_idx on public.children(family_id);
create index baby_logs_family_child_recorded_at_idx
  on public.baby_logs(family_id, child_id, recorded_at desc);
create index baby_logs_created_by_idx on public.baby_logs(created_by);
create index media_assets_family_child_captured_at_idx
  on public.media_assets(family_id, child_id, captured_at desc);
create index media_assets_created_by_idx on public.media_assets(created_by);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger families_set_updated_at
before update on public.families
for each row execute function public.set_updated_at();

create trigger family_members_set_updated_at
before update on public.family_members
for each row execute function public.set_updated_at();

create trigger children_set_updated_at
before update on public.children
for each row execute function public.set_updated_at();

create trigger baby_logs_set_updated_at
before update on public.baby_logs
for each row execute function public.set_updated_at();

create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

create function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = target_family_id
      and user_id = auth.uid()
  );
$$;

create function public.is_family_parent(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = target_family_id
      and user_id = auth.uid()
      and role = 'parent'
  );
$$;

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.children enable row level security;
alter table public.baby_logs enable row level security;
alter table public.media_assets enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.families to authenticated;
grant select, insert, update, delete on public.family_members to authenticated;
grant select, insert, update, delete on public.children to authenticated;
grant select, insert, update, delete on public.baby_logs to authenticated;
grant select, insert, update on public.media_assets to authenticated;
grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.is_family_parent(uuid) to authenticated;

create policy "members can read their families"
on public.families
for select
to authenticated
using (public.is_family_member(id));

create policy "users can create owned families"
on public.families
for insert
to authenticated
with check (created_by = auth.uid());

create policy "parents can update families"
on public.families
for update
to authenticated
using (public.is_family_parent(id))
with check (public.is_family_parent(id));

create policy "parents can delete families"
on public.families
for delete
to authenticated
using (public.is_family_parent(id));

create policy "members can read family members"
on public.family_members
for select
to authenticated
using (public.is_family_member(family_id));

create policy "parents can add family members"
on public.family_members
for insert
to authenticated
with check (public.is_family_parent(family_id));

create policy "parents can update family members"
on public.family_members
for update
to authenticated
using (public.is_family_parent(family_id))
with check (public.is_family_parent(family_id));

create policy "parents can remove family members"
on public.family_members
for delete
to authenticated
using (public.is_family_parent(family_id));

create policy "members can read children"
on public.children
for select
to authenticated
using (public.is_family_member(family_id));

create policy "parents can create children"
on public.children
for insert
to authenticated
with check (public.is_family_parent(family_id));

create policy "parents can update children"
on public.children
for update
to authenticated
using (public.is_family_parent(family_id))
with check (public.is_family_parent(family_id));

create policy "parents can delete children"
on public.children
for delete
to authenticated
using (public.is_family_parent(family_id));

create policy "members can read baby logs"
on public.baby_logs
for select
to authenticated
using (public.is_family_member(family_id));

create policy "parents can create baby logs"
on public.baby_logs
for insert
to authenticated
with check (
  public.is_family_parent(family_id)
  and created_by = auth.uid()
);

create policy "parents can update baby logs"
on public.baby_logs
for update
to authenticated
using (public.is_family_parent(family_id))
with check (public.is_family_parent(family_id));

create policy "parents can delete baby logs"
on public.baby_logs
for delete
to authenticated
using (public.is_family_parent(family_id));

create policy "members can read media assets"
on public.media_assets
for select
to authenticated
using (public.is_family_member(family_id));

create policy "parents can create media assets"
on public.media_assets
for insert
to authenticated
with check (
  public.is_family_parent(family_id)
  and created_by = auth.uid()
);

create policy "parents can update media assets"
on public.media_assets
for update
to authenticated
using (public.is_family_parent(family_id))
with check (public.is_family_parent(family_id));
