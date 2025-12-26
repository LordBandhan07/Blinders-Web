# Supabase Setup - SIMPLIFIED VERSION

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Schema SQL
1. Go to Supabase → **SQL Editor**
2. Copy `supabase/schema.sql` content
3. Paste and **Run**

### Step 2: Create Users in Dashboard
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Create these 4 users (one by one):

| Email | Password | Auto Confirm |
|-------|----------|--------------|
| arthur.b@blinders.chief | LordBandhan@Blinders07 | ✅ YES |
| steve.s@blinders.president | MrSteve@Blinders7 | ✅ YES |
| robert.s@blinders.chiefmember | MrRobert@Blinders7 | ✅ YES |
| anthoni.b@blinders.seniormember | MrAnthony@Blinders7 | ✅ YES |

**Note:** Just fill Email, Password, and check "Auto Confirm User". Ignore metadata!

### Step 3: Add Profiles
1. Go back to **SQL Editor**
2. Copy `supabase/add-profiles.sql` content
3. Paste and **Run**

### Step 4: Verify
Run this query:
```sql
SELECT email, display_name, role 
FROM public.profiles;
```

You should see 4 users! ✅

### Step 5: Update .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get from: **Settings** → **API**

### Step 6: Test Login
- Email: `arthur.b@blinders.chief`
- Password: `LordBandhan@Blinders07`

## ✅ Done!
