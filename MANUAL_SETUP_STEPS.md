# 🚀 Blinders - Complete Supabase Setup Guide

## 📋 Overview
This guide will help you set up a **NEW** Supabase project for Blinders from scratch.

---

## ⚙️ PART 1: Create New Supabase Project

### Step 1: Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `Blinders` (or any name)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### Step 2: Get API Keys
1. In your new project, go to **Settings** → **API**
2. Copy these values (you'll need them):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (different long string)

---

## 🗄️ PART 2: Run SQL Setup

### Step 1: Open SQL Editor
1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **"New query"**

### Step 2: Run Complete Setup Script
1. Open the file: `COMPLETE_SUPABASE_SETUP.sql`
2. **Copy the ENTIRE contents** (all ~350 lines)
3. **Paste** into the SQL Editor
4. Click **"RUN"** (bottom right)
5. Wait for success message: ✅ "Success. No rows returned"

### Step 3: Verify Tables Created
1. Click **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `messages`
   - ✅ `direct_messages`
   - ✅ `conversations`
   - ✅ `message_reactions`
   - ✅ `dm_reactions`

---

## 📦 PART 3: Setup Storage Buckets

### Step 1: Create Buckets
1. Go to **Storage** (left sidebar)
2. Click **"Create a new bucket"**
3. Create these 4 buckets:

#### Bucket 1: `profile-photos`
```
Name: profile-photos
Public: ✅ Yes
File size limit: 2 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

#### Bucket 2: `chat-media`
```
Name: chat-media
Public: ✅ Yes
File size limit: 10 MB
Allowed MIME types: image/jpeg, image/png, image/webp, image/gif, video/mp4, audio/mpeg
```

#### Bucket 3: `chat-images` (optional, for organization)
```
Name: chat-images
Public: ✅ Yes
File size limit: 5 MB
Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
```

#### Bucket 4: `chat-voice` (optional)
```
Name: chat-voice
Public: ✅ Yes
File size limit: 10 MB
Allowed MIME types: audio/mpeg, audio/webm, audio/ogg
```

### Step 2: Add Storage Policies
For **EACH bucket**, add these policies:

1. Click on the bucket name
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Select **"Custom"**
5. Add these 4 policies:

**Policy 1: Allow authenticated uploads**
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');
```

**Policy 2: Allow public read**
```sql
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
```

**Policy 3: Allow users to update own files**
```sql
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Policy 4: Allow users to delete own files**
```sql
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**IMPORTANT**: Replace `'profile-photos'` with the actual bucket name for each bucket!

---

## 🔐 PART 4: Configure Authentication

### Step 1: Enable Email Auth
1. Go to **Authentication** → **Providers**
2. Find **"Email"**
3. Make sure it's **ENABLED** ✅

### Step 2: Disable Email Confirmation (for development)
1. Go to **Authentication** → **Settings**
2. Find **"Enable email confirmations"**
3. **DISABLE** it (for easier testing)
4. Click **"Save"**

### Step 3: Set Site URL
1. Still in **Authentication** → **Settings**
2. Find **"Site URL"**
3. Set to: `http://localhost:3000` (for development)
4. Click **"Save"**

---

## 🌐 PART 5: Enable Realtime

### Step 1: Enable Realtime Service
1. Go to **Settings** → **API**
2. Scroll to **"Realtime"** section
3. Make sure **"Enable Realtime"** is **ON** ✅

### Step 2: Verify Realtime Tables
1. Go to **Database** → **Replication**
2. You should see these tables in the publication:
   - ✅ `profiles`
   - ✅ `messages`
   - ✅ `direct_messages`
   - ✅ `message_reactions`
   - ✅ `dm_reactions`

---

## 🔧 PART 6: Configure Environment Variables

### Step 1: Create `.env.local` file
In your Blinders project root, create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Replace with YOUR values from Step 2 of Part 1
```

### Step 2: Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

---

## ✅ PART 7: Verify Setup

### Test 1: Check Database Connection
1. Open your app: `http://localhost:3000`
2. Open browser console (F12)
3. You should NOT see any Supabase errors

### Test 2: Test Login
1. Go to `/login`
2. Try logging in with existing credentials
3. If no users exist, you'll need to create one manually in Supabase

### Test 3: Create First User (if needed)
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add user"**
3. Fill in:
   - Email: `admin@blinders.com`
   - Password: `admin123` (or your choice)
   - Auto Confirm User: ✅ Yes
4. Click **"Create user"**
5. Go to **Table Editor** → **profiles**
6. Click **"Insert row"**
7. Fill in:
   - `id`: (copy the user ID from Authentication → Users)
   - `email`: `admin@blinders.com`
   - `display_name`: `Admin`
   - `role`: `admin`
8. Click **"Save"**

### Test 4: Test Realtime
1. Open `/home/members` in TWO different browsers
2. Login as different users in each
3. Both should see each other as online (green dot)

---

## 🎯 Quick Checklist

- [ ] Created new Supabase project
- [ ] Copied API keys
- [ ] Ran `COMPLETE_SUPABASE_SETUP.sql`
- [ ] Verified 6 tables created
- [ ] Created 4 storage buckets
- [ ] Added storage policies to each bucket
- [ ] Enabled Email authentication
- [ ] Disabled email confirmation
- [ ] Set Site URL to `http://localhost:3000`
- [ ] Enabled Realtime service
- [ ] Verified Realtime tables in replication
- [ ] Created `.env.local` with API keys
- [ ] Restarted `npm run dev`
- [ ] Created first admin user
- [ ] Tested login
- [ ] Tested realtime presence

---

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists in project root
- Verify keys are correct (no extra spaces)
- Restart `npm run dev`

### "Invalid login credentials"
- Make sure user exists in Authentication → Users
- Make sure profile exists in Table Editor → profiles
- IDs must match between auth.users and profiles table

### "Realtime not working"
- Check Settings → API → Realtime is ENABLED
- Check Database → Replication shows your tables
- Check browser console for errors
- Try logging out and back in

### "Upload failed"
- Check Storage buckets exist
- Check bucket policies are added
- Check file size limits

---

## 📞 Need Help?

If setup fails:
1. Check browser console for errors (F12)
2. Check Supabase Dashboard → Logs
3. Verify all checklist items above
4. Send screenshot of error

---

**🎉 Setup Complete! Your Blinders app should now be fully connected to Supabase.**
