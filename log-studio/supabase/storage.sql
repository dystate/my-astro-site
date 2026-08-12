-- Run this once in Supabase Dashboard > SQL Editor.
-- The bucket is public because published Markdown pages need permanent image URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'log-assets',
  'log-assets',
  true,
  12582912,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view published log assets"
on storage.objects for select
to public
using (bucket_id = 'log-assets');

create policy "Authenticated editors can upload own log assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'log-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Authenticated editors can update own log assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'log-assets'
  and owner_id = (select auth.uid()::text)
)
with check (
  bucket_id = 'log-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Authenticated editors can delete own log assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'log-assets'
  and owner_id = (select auth.uid()::text)
);
