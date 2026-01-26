# Cloudflare Pages Deployment Guide

This guide will help you deploy Campus Connect to Cloudflare Pages.

## Prerequisites

- A Cloudflare account (free tier works fine)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Supabase project set up and running

## Deployment Steps

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. **Push your code to GitHub/GitLab**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Cloudflare Dashboard**
   - Visit <https://dash.cloudflare.com/>
   - Navigate to "Workers & Pages" in the left sidebar
   - Click "Create application"
   - Select "Pages" tab
   - Click "Connect to Git"

3. **Connect your repository**
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Cloudflare to access your repositories
   - Select your Campus Connect repository

4. **Configure build settings**
   - **Project name**: `campus-connect` (or your preferred name)
   - **Production branch**: `main` (or your default branch)
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

5. **Add environment variables**
   Click "Environment variables" and add:

   ```
   VITE_SUPABASE_URL = 
   VITE_SUPABASE_ANON_KEY = 
   BREVO_API_KEY = 
   ```

   **Important**: Add these for both "Production" and "Preview" environments.

6. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare will build and deploy your site
   - Wait for the build to complete (usually 2-5 minutes)

7. **Access your site**
   - Once deployed, you'll get a URL like: `https://campus-connect.pages.dev`
   - You can also add a custom domain in the settings

### Option 2: Deploy via Wrangler CLI

1. **Install Wrangler**

   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**

   ```bash
   wrangler login
   ```

3. **Build your project**

   ```bash
   npm run build
   ```

4. **Deploy**

   ```bash
   wrangler pages deploy dist --project-name=campus-connect
   ```

5. **Set environment variables**

   ```bash
   wrangler pages secret put VITE_SUPABASE_URL
   wrangler pages secret put VITE_SUPABASE_ANON_KEY
   wrangler pages secret put BREVO_API_KEY
   ```

## Post-Deployment Configuration

### 1. Update Supabase Settings

Go to your Supabase project dashboard:

1. **Authentication > URL Configuration**
   - Add your Cloudflare Pages URL to "Site URL"
   - Add to "Redirect URLs":

     ```
     https://your-site.pages.dev/*
     https://your-site.pages.dev/app
     https://your-site.pages.dev/onboarding
     ```

2. **Authentication > Email Templates**
   - Update email templates to use your new domain

### 2. Configure Custom Domain (Optional)

1. In Cloudflare Pages dashboard, go to your project
2. Click "Custom domains" tab
3. Click "Set up a custom domain"
4. Enter your domain (e.g., `campusconnect.com`)
5. Follow the DNS configuration instructions
6. Wait for SSL certificate to be provisioned (automatic)

### 3. Enable Preview Deployments

Cloudflare automatically creates preview deployments for:

- Every pull request
- Every branch push

Preview URLs look like: `https://abc123.campus-connect.pages.dev`

## Continuous Deployment

Once set up, Cloudflare Pages will automatically:

- Deploy on every push to your main branch
- Create preview deployments for pull requests
- Run your build command
- Serve your site globally via Cloudflare's CDN

## Troubleshooting

### Build Fails

1. Check build logs in Cloudflare dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node version (should be 18+)
4. Test build locally: `npm run build`

### Environment Variables Not Working

1. Ensure variables start with `VITE_` prefix
2. Redeploy after adding variables
3. Check they're set for both Production and Preview

### Routing Issues (404 on refresh)

- The `_redirects` file should handle this
- Ensure it's in the `public` folder
- Content should be: `/* /index.html 200`

### Supabase Connection Issues

1. Verify environment variables are set correctly
2. Check Supabase URL configuration includes your Cloudflare domain
3. Ensure CORS is enabled in Supabase

## Performance Optimization

Cloudflare Pages automatically provides:

- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ HTTP/2 and HTTP/3
- ✅ Brotli compression
- ✅ DDoS protection
- ✅ Unlimited bandwidth (on free tier)

## Monitoring

1. **Analytics**: Available in Cloudflare dashboard
2. **Build logs**: Check deployment history
3. **Error tracking**: Consider adding Sentry or similar

## Useful Commands

```bash
# View deployment logs
wrangler pages deployment list --project-name=campus-connect

# Rollback to previous deployment
wrangler pages deployment tail --project-name=campus-connect

# Delete a deployment
wrangler pages deployment delete <deployment-id> --project-name=campus-connect
```

## Support

- Cloudflare Pages Docs: <https://developers.cloudflare.com/pages/>
- Cloudflare Community: <https://community.cloudflare.com/>
- Supabase Docs: <https://supabase.com/docs>

## Security Notes

⚠️ **Important**:

- Never commit `.env` file to Git
- Keep your API keys secure
- Use environment variables for all sensitive data
- The `VITE_SUPABASE_ANON_KEY` is safe to expose (it's meant for client-side use)
- Keep `BREVO_API_KEY` secure (only use in Supabase Edge Functions)

## Next Steps

After deployment:

1. Test all features on the live site
2. Set up custom domain
3. Configure email templates with new domain
4. Share the link with your users!

---

**Your site will be live at**: `https://campus-connect.pages.dev` (or your custom domain)

Enjoy your deployment! 🚀
