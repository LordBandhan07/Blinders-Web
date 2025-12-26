# Supabase Storage Setup for Media Upload

## Step 1: Create Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **New bucket**
3. Bucket name: `chat-media`
4. **Public bucket:** ✅ YES (check this)
5. Click **Create bucket**

## Step 2: Configure Storage Policies

Go to **SQL Editor** and run this:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-media');

-- Allow everyone to view files (public bucket)
CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

-- Users can delete their own uploads
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Step 3: Verify Setup

Run this query to check:

```sql
SELECT * FROM storage.buckets WHERE name = 'chat-media';
```

You should see your bucket!

## Step 4: Test Upload (Optional)

In Storage → chat-media:
- Click **Upload file**
- Upload a test image
- Verify you can see it

## ✅ Done!

Storage is ready for media uploads!
