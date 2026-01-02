# Quick Fix Guide - "Failed to Fetch User Profile" Error

## Problem
Getting "failed to fetch user profile" error when trying to login.

## Root Cause
This happens when:
1. ❌ No `.env.local` file exists with Supabase credentials
2. ❌ No user exists in Supabase Authentication
3. ❌ User exists in auth but no profile in `profiles` table

## Solution

### Step 1: Verify `.env.local` File Exists
Check if `.env.local` file exists in your project root.

**If it doesn't exist:**
1. Copy `ENV_TEMPLATE.md` content
2. Create new file: `.env.local`
3. Paste the content
4. **Restart your dev server**: Stop (Ctrl+C) and run `npm run dev` again

### Step 2: Create Your First User in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   ```
   Email: admin@blinders.com
   Password: admin123
   Auto Confirm User: ✅ YES (important!)
   ```
4. Click **"Create user"**
5. **Copy the User ID** (looks like: `123e4567-e89b-12d3-a456-426614174000`)

### Step 3: Create Profile for the User

1. Go to **Table Editor** → **profiles** table
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   ```
   id: [paste the User ID from step 2]
   email: admin@blinders.com
   display_name: Admin
   role: admin
   ```
4. Click **"Save"**

### Step 4: Test Login

1. Go to `http://localhost:3000/login`
2. Login with:
   - Email: `admin@blinders.com`
   - Password: `admin123`
3. Should work now! ✅

## Still Getting Error?

### Check Browser Console
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for error messages
4. Common errors:
   - `"Invalid API key"` → Check `.env.local` has correct keys
   - `"Row not found"` → Profile doesn't exist in profiles table
   - `"Invalid login credentials"` → Wrong password or user doesn't exist

### Verify Environment Variables
Run this in terminal:
```bash
cat .env.local
```

Should show:
```
NEXT_PUBLIC_SUPABASE_URL=https://xwunxmkabrswngwponqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

If file doesn't exist or keys are wrong, fix it and **restart dev server**.

## Quick Checklist

- [ ] `.env.local` file exists in project root
- [ ] `.env.local` has correct Supabase URL and keys
- [ ] Restarted `npm run dev` after creating/editing `.env.local`
- [ ] Created user in Supabase Authentication
- [ ] Created matching profile in profiles table
- [ ] User ID matches between auth.users and profiles table
- [ ] Tried logging in with correct credentials

---

**Most Common Fix:** Create `.env.local` file and restart dev server!


steve.s@blinders.org
=> steve.agent07
=> 17800ca4-c566-4945-ac6d-38d36684467e
robert.s@blinders.org
=> robert.agent07
=> 4322e76a-34e5-46ee-89aa-9f0087c028df
arthur.b@blinders.org
=> 66eec8ac-b7ae-4fb3-95d4-855d960c96d9
anthony.b@blinders.org
=> anthony.agent07
=> c7c73422-562e-4cd1-9eaf-a21448aed2ad