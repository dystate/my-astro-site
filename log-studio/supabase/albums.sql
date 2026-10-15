-- Run once in Supabase SQL Editor to enable Life Manager ALBUM publishing.
create table if not exists public.album_entries (
  slug text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '{}',
  published boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint album_entries_slug_format check (slug ~ '^[a-z0-9_-]+$')
);

create index if not exists album_entries_owner_updated_idx
on public.album_entries (owner_id, updated_at desc);

alter table public.album_entries enable row level security;

revoke all on table public.album_entries from anon, authenticated;
grant select on table public.album_entries to anon;
grant select, insert, update, delete on table public.album_entries to authenticated;

drop policy if exists "Public can read published albums" on public.album_entries;
drop policy if exists "Visitors can read published albums" on public.album_entries;
create policy "Visitors can read published albums"
on public.album_entries for select
to anon
using (published = true);

drop policy if exists "Owners can read their albums" on public.album_entries;
drop policy if exists "Signed in users can read albums" on public.album_entries;
create policy "Signed in users can read albums"
on public.album_entries for select
to authenticated
using (published = true or (select auth.uid()) = owner_id);

drop policy if exists "Owners can create albums" on public.album_entries;
create policy "Owners can create albums"
on public.album_entries for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can update albums" on public.album_entries;
create policy "Owners can update albums"
on public.album_entries for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can delete albums" on public.album_entries;
create policy "Owners can delete albums"
on public.album_entries for delete
to authenticated
using ((select auth.uid()) = owner_id);
