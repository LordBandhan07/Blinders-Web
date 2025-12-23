# Supabase Storage Setup Instructions

## 📦 Storage Buckets to Create

Go to Supabase Dashboard → Storage → Create new buckets:

### 1. **avatars** bucket
```
Name: avatars
Public: Yes (so avatars can be displayed)
File size limit: 2MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

### 2. **chat-images** bucket
```
Name: chat-images
Public: Yes
File size limit: 5MB
Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
```

### 3. **chat-videos** bucket
```
Name: chat-videos
Public: Yes
File size limit: 50MB
Allowed MIME types: video/mp4, video/webm
```

### 4. **chat-voice** bucket
```
Name: chat-voice
Public: Yes
File size limit: 10MB
Allowed MIME types: audio/mpeg, audio/webm, audio/ogg
```

## 🔐 Storage Policies

For each bucket, add these RLS policies in Supabase Dashboard:

### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
```

### Policy 2: Allow public read access
```sql
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### Policy 3: Allow users to update their own files
```sql
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Policy 4: Allow users to delete their own files
```sql
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Repeat these policies for all 4 buckets** (avatars, chat-images, chat-videos, chat-voice)

## ✅ Quick Setup Checklist

- [ ] Create `avatars` bucket (public, 2MB limit)
- [ ] Create `chat-images` bucket (public, 5MB limit)
- [ ] Create `chat-videos` bucket (public, 50MB limit)
- [ ] Create `chat-voice` bucket (public, 10MB limit)
- [ ] Add RLS policies for each bucket
- [ ] Test upload from the app

## 🔗 File URL Format

After upload, files will be accessible at:
```
https://[project-id].supabase.co/storage/v1/object/public/[bucket-name]/[file-path]
```

Example:
```
https://abc123.supabase.co/storage/v1/object/public/avatars/user-123/avatar.jpg
```
