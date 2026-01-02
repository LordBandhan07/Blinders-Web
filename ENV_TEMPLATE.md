# .env.local Template for Blinders

# ============================================
# SUPABASE CONFIGURATION
# ============================================
# Get these from: Supabase Dashboard → Settings → API

# Your Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Supabase Anon/Public Key (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# Supabase Service Role Key (KEEP SECRET! Server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# ============================================
# INSTRUCTIONS
# ============================================
# 1. Copy this file and rename to: .env.local
# 2. Replace xxxxx with your actual Supabase values
# 3. Never commit .env.local to git (it's in .gitignore)
# 4. Restart your dev server after changing these values
#
# To get your keys:
# - Go to Supabase Dashboard
# - Click on your project
# - Go to Settings → API
# - Copy "Project URL" and both keys
