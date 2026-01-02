# Members Online Status Not Working - Troubleshooting Guide

## Problem
The Members page is not showing correct online/offline status for users.

## Root Causes (Most Likely)

### 1. Supabase Realtime Not Enabled
**Check:** Go to Supabase Dashboard → Settings → API
- Look for "Realtime" section
- Ensure it's **ENABLED**
- If disabled, enable it and restart your app

### 2. Browser Console Errors
**Check:** Open browser console (F12) when on `/home/members`

**Expected logs:**
```
🔔 Setting up presence tracking for user: [ID]
📡 Presence subscription status: SUBSCRIBED
✅ Presence tracked for: [ID]
💓 Heartbeat sent (every 30 seconds)
```

**If you see errors:**
- `CHANNEL_ERROR` → Realtime is disabled in Supabase
- `Authentication error` → Session expired, logout and login again
- No logs at all → JavaScript error, check console for red errors

### 3. Multiple Tabs/Windows
**Issue:** If you have multiple tabs open with the same user, presence might conflict

**Fix:** Close all tabs, open only ONE tab per user

### 4. Test with TWO Different Users
**Steps:**
1. Open browser in normal mode, login as User A
2. Open browser in incognito mode, login as User B
3. Both go to `/home/members`
4. Check if they see each other as online (green dot)

## Quick Fix Steps

1. **Logout and Login again** (clears any stale sessions)
2. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check Supabase Dashboard** → Settings → API → Realtime is ON
4. **Open browser console** and look for errors
5. **Test with 2 different browsers** (not just 2 tabs)

## If Still Not Working

Send me a screenshot of:
1. Browser console when on `/home/members`
2. Supabase Dashboard → Settings → API (Realtime section)

This will help me identify the exact issue.
