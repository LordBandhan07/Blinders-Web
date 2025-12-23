# Blinders - Vercel Deployment Configuration

# Environment Variables (Set in Vercel Dashboard)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Build Settings
NODE_VERSION=18.x

# Security Settings
- Enable HTTPS only
- Enable automatic HTTPS redirects
- Set custom domain (optional)

# Deployment Steps:

## 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial Blinders deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

## 2. Import to Vercel
- Go to vercel.com
- Click "Import Project"
- Select your GitHub repository
- Configure environment variables
- Deploy!

## 3. Set Environment Variables in Vercel
Go to Project Settings > Environment Variables and add:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## 4. Custom Domain (Optional)
- Go to Project Settings > Domains
- Add your custom domain
- Update DNS records as instructed

## Security Checklist:
✅ HTTPS enforced
✅ Security headers configured
✅ Environment variables secured
✅ Cookie settings: httpOnly, secure, sameSite=strict
✅ CORS properly configured
✅ Rate limiting (consider adding Vercel Edge Config)
✅ Input validation on all forms
✅ SQL injection prevention (Supabase handles this)
✅ XSS protection headers
✅ CSRF protection via sameSite cookies

## Performance Optimizations:
✅ Image optimization enabled
✅ Automatic code splitting
✅ Static generation where possible
✅ Edge caching
✅ Compression enabled
