-- Migration 002: Storage bucket setup for complaint attachments

-- 1. Create the storage bucket if it doesn't already exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-attachments',
  'complaint-attachments',
  true,
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- 2. Storage RLS Policies
create policy "Authenticated users can upload attachments"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'complaint-attachments');

create policy "Attachments viewable by authenticated users"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'complaint-attachments');

create policy "Users can delete their own uploaded attachments"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'complaint-attachments' and auth.uid() = owner);
