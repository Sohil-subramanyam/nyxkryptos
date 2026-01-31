# DEPLOYMENT GUIDE - Nyx Kryptos

This guide will help you deploy Nyx Kryptos to production with Supabase hosting.

## Prerequisites

- GitHub account with your code pushed
- Vercel account (https://vercel.com)
- Supabase account (https://supabase.com)
- Google Gemini API key from Google AI Studio

## Step 1: Get Your Google Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Get API Key"
3. Create a new API key (or use existing)
4. Copy the key - you'll need it in Step 3

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Paste your GitHub repo URL
4. Vercel will auto-detect it's a Next.js project
5. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
vercel

# Follow prompts to connect GitHub and deploy
```

## Step 3: Set Environment Variables

### In Vercel Dashboard:

1. Go to your project Settings
2. Navigate to "Environment Variables"
3. Add these variables:

```
API_KEY = your_gemini_api_key_here
NEXT_PUBLIC_APP_NAME = Nyx Kryptos
```

4. Click "Save"
5. Redeploy to apply changes

### Or via Vercel CLI:

```bash
vercel env add API_KEY
# Paste your Gemini API key

vercel env add NEXT_PUBLIC_APP_NAME
# Enter: Nyx Kryptos

vercel --prod
```

## Step 4: Verify Deployment

1. After deployment completes, Vercel will provide a URL
2. Visit the URL in your browser
3. You should see the Nyx Kryptos landing page
4. Test the app:
   - Click "INITIALIZE VAULT"
   - Create a test vault
   - Verify encryption and artifact generation

## Step 5: Optional - Supabase Integration

For production with persistent storage:

### Setup Supabase

1. Go to https://supabase.com and sign up
2. Create a new project (choose region closest to users)
3. Wait for project initialization
4. Go to Project Settings → API → Keys
5. Copy your:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)

### Add Supabase Variables to Vercel

In Vercel dashboard or CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your Supabase URL

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your Service Role Key
```

### Run Database Migration (Optional)

```bash
# In your local project directory:
npm run db:setup

# Or manually:
# - Go to Supabase SQL Editor
# - Run the SQL from scripts/setup-supabase.sql
```

### Update Storage Service

In `services/storageService.ts`, update to use Supabase:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Then use supabase client for storage operations
```

## Step 6: Custom Domain (Optional)

1. In Vercel dashboard, go to project Settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions from your domain registrar

## Troubleshooting

### "API_KEY is not set" Error

- Verify `API_KEY` is added to Vercel environment variables
- Wait 60 seconds after adding for changes to propagate
- Try redeploying: `vercel --prod`

### "Cannot find module" Errors

- Ensure all files were properly committed to GitHub
- Run `npm install` locally to verify dependencies
- Check that all import paths use `@/` aliases correctly

### "Failed to load image" in Steganography

- Ensure `crossOrigin="anonymous"` is set on images
- Check browser console for CORS errors
- Verify image URLs are accessible

### Artifacts Not Generating

- Check Google Gemini API is enabled
- Verify API key quota hasn't been exceeded
- Check browser console for AI service errors

## Performance Optimization

### Enable Vercel Analytics

1. In Vercel dashboard, go to Settings
2. Enable "Web Analytics"
3. This helps monitor performance

### Optimize Images

Nyx Kryptos already uses optimized images via Next.js Image component, but you can:
- Compress artifacts before embedding
- Use WebP format for better compression

### Database Optimization (with Supabase)

```sql
-- Create indexes for faster queries
CREATE INDEX idx_vaults_user ON vaults(creator_email);
CREATE INDEX idx_shares_vault ON shares(vault_id);
CREATE INDEX idx_artifacts_target ON pending_artifacts(target_email);
```

## Monitoring

### Setup Error Tracking

We recommend integrating Sentry for error monitoring:

```bash
npm install @sentry/nextjs

# Then configure in vercel env:
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### View Logs

In Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Select latest deployment
4. Click "View Function Logs"

## Security Best Practices

1. **Rotate API Keys Regularly**
   - Generate new Gemini API keys monthly
   - Update in Vercel environment variables

2. **Enable Two-Factor Authentication**
   - On Vercel account
   - On Supabase account
   - On GitHub account

3. **Use Environment Secrets**
   - Never commit `.env.local` to git
   - Use `git-ignored` files for local testing
   - All secrets go in Vercel dashboard

4. **Monitor Usage**
   - Set up Gemini API quota alerts
   - Monitor Supabase database usage
   - Track Vercel bandwidth usage

5. **Regular Backups**
   - Export Supabase data regularly
   - Store backups securely offsite

## Scaling

As your app grows:

1. **Database**: Upgrade Supabase tier for higher throughput
2. **API Limits**: Request higher Gemini API quotas
3. **CDN**: Vercel automatically uses edge locations globally
4. **Caching**: Implement Redis for frequently accessed data

## Rollback

If you need to revert to a previous version:

1. In Vercel dashboard, go to Deployments
2. Find the deployment to revert to
3. Click "..." menu
4. Select "Promote to Production"

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Google Gemini API**: https://ai.google.dev

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Authentication works
- [ ] Can create vaults
- [ ] Artifacts generate correctly
- [ ] Can unlock vaults with correct threshold
- [ ] Error handling works
- [ ] Analytics are tracking
- [ ] Environment variables are set
- [ ] Custom domain resolves (if applicable)
- [ ] SSL certificate is valid
- [ ] Backups are configured
- [ ] Monitoring is active
