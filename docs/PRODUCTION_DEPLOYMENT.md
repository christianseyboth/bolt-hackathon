# Production Deployment Guide

This guide covers deploying SecPilot to production with the correct API domain configuration.

## Environment Variables

### Required Environment Variables for Production

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://secpilot.io
NODE_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# Stripe Configuration (Live Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# OAuth Configuration
GOOGLE_CLIENT_ID=your_production_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_production_google_oauth_client_secret
GITHUB_CLIENT_ID=your_production_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_production_github_oauth_client_secret
```

## API Domain Configuration

The application automatically detects the correct API domain based on the environment:

### Development (localhost)

- API Base URL: `http://localhost:3000/api/v1`
- Used when `NODE_ENV=development` or when running on localhost

### Production (secpilot.io)

- API Base URL: `https://secpilot.io/api/v1`
- Used when `NODE_ENV=production` or when running on secpilot.io domain

### API Documentation Examples

The API documentation in the dashboard will automatically show the correct domain:

**Development:**

```bash
curl -X GET "http://localhost:3000/api/v1/analyses" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Production:**

```bash
curl -X GET "https://secpilot.io/api/v1/analyses" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Deployment Steps

### 1. Update Environment Variables

Set the production environment variables in your deployment platform:

- **Vercel**: Add to Project Settings > Environment Variables
- **Netlify**: Add to Site Settings > Environment Variables
- **Railway**: Add to Project Settings > Variables
- **Docker**: Update your docker-compose.yml or Dockerfile

### 2. Update OAuth Redirect URLs

Update your OAuth applications to include production URLs:

**Google OAuth:**

- Authorized JavaScript origins: `https://secpilot.io`
- Authorized redirect URIs: `https://your-supabase-project.supabase.co/auth/v1/callback`

**GitHub OAuth:**

- Authorization callback URL: `https://your-supabase-project.supabase.co/auth/v1/callback`

### 3. Update Stripe Configuration

1. Switch to Live mode in Stripe Dashboard
2. Create products and prices in Live mode
3. Update webhook endpoint: `https://secpilot.io/api/stripe/webhook`
4. Update environment variables with live keys

### 4. Update Supabase Configuration

1. Update site URL in Supabase: `https://secpilot.io`
2. Add production domain to allowed origins
3. Update OAuth redirect URLs in Supabase Auth settings

### 5. DNS Configuration

Point your domain to your deployment platform:

```
# Example DNS records for Vercel
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## API Endpoints

After deployment, your API will be available at:

- **Account Info**: `https://secpilot.io/api/v1/account`
- **Email Analyses**: `https://secpilot.io/api/v1/analyses`
- **Usage Statistics**: `https://secpilot.io/api/v1/usage`

## Testing Production API

Test your production API endpoints:

```bash
# Test account endpoint
curl -X GET "https://secpilot.io/api/v1/account" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Test analyses endpoint
curl -X GET "https://secpilot.io/api/v1/analyses?limit=5" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Test usage endpoint
curl -X GET "https://secpilot.io/api/v1/usage?period=7d" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Troubleshooting

### API Domain Issues

If API calls are failing:

1. Check `NODE_ENV` is set to `production`
2. Verify `NEXT_PUBLIC_SITE_URL` is set correctly
3. Ensure DNS is pointing to your deployment
4. Check browser console for CORS errors

### OAuth Issues

If authentication is failing:

1. Verify OAuth redirect URLs are updated
2. Check Supabase site URL configuration
3. Ensure OAuth client IDs are for production apps

### Stripe Issues

If payments are failing:

1. Verify you're using live mode keys
2. Check webhook endpoint is correct
3. Ensure webhook secret is updated
4. Test with Stripe CLI: `stripe listen --forward-to https://secpilot.io/api/stripe/webhook`

## Monitoring

Monitor your production deployment:

- **API Logs**: Check your deployment platform logs
- **Supabase Logs**: Monitor database and auth logs
- **Stripe Dashboard**: Monitor payment events
- **Error Tracking**: Consider adding Sentry or similar

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] OAuth apps are configured for production
- [ ] Stripe is in live mode with correct webhook endpoint
- [ ] Database has proper RLS policies
- [ ] API keys are properly secured
- [ ] HTTPS is enforced
- [ ] CORS is configured correctly
