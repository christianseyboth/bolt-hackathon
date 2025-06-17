# 🚀 Live Mode Setup Guide

## 1. Create Live Products in Stripe

### Step 1: Switch to Live Mode in Stripe Dashboard

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Toggle to **Live Mode** (top left)

### Step 2: Create Your Products

Create these products with pricing:

**Solo Plan:**

- Monthly: `$X/month`
- Yearly: `$X/year`

**Entrepreneur Plan:**

- Monthly: `$X/month`
- Yearly: `$X/year`

**Team Plan:**

- Monthly: `$X/month`
- Yearly: `$X/year`

### Step 3: Copy Live Price IDs ✅ COMPLETED

✅ **Live price IDs have been updated in the code:**

```typescript
// Solo plan
'price_1RauH4CsZBRpsVkXOXdBujCQ': 'Solo', // Solo Monthly
'price_1RauH4CsZBRpsVkXa0dT3xwB': 'Solo', // Solo Yearly

// Entrepreneur plan
'price_1RauH0CsZBRpsVkXHz5yaTaZ': 'Entrepreneur', // Entrepreneur Monthly
'price_1RauH0CsZBRpsVkXnwphSPYL': 'Entrepreneur', // Entrepreneur Yearly

// Team plan
'price_1RauGuCsZBRpsVkXItMdS7b8': 'Team', // Team Monthly
'price_1RauGuCsZBRpsVkXqyMwPuFO': 'Team', // Team Yearly
```

## 2. Environment Variables

### Netlify Environment Variables

Set these in **Netlify Dashboard > Site Settings > Environment Variables**:

```bash
# Stripe Live Keys
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Site URL
NEXT_PUBLIC_SITE_URL=https://secpilot.io

# Supabase (should already be set)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Other APIs
LINGODOTDEV_API_KEY=your-lingo-api-key
NEXT_TELEMETRY_DISABLED=1
```

## 3. Webhook Configuration

✅ **Already Done:** Your webhook endpoint is set to: `https://secpilot.io/api/stripe/webhook`

**Make sure these events are selected:**

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## 4. Testing Checklist

### Before Going Live:

- [x] Live price IDs updated in webhook handler ✅
- [ ] Environment variables set in Netlify 🔄 NEXT STEP
- [ ] Test subscription creation with real card
- [ ] Verify webhook events are received
- [ ] Test subscription upgrade/downgrade
- [ ] Test subscription cancellation

### Test with Real Card:

Use a real credit card with a small amount to test the full flow.

### Monitor Webhook Events:

Check **Stripe Dashboard > Developers > Webhooks > [Your Endpoint]** for successful deliveries.

## 5. Post-Launch Monitoring

- Monitor webhook delivery success rates
- Check for failed payments in Stripe Dashboard
- Set up alerts for critical webhook failures
- Remove test price IDs from code after confirming live mode works

## 6. Security Notes

- ✅ Never commit live API keys to version control
- ✅ Rotate keys periodically
- ✅ Monitor for unauthorized webhook calls
- ✅ Use HTTPS only (already configured)

---

## Need Help?

If webhooks fail, check:

1. Stripe Dashboard > Webhooks > Recent Deliveries
2. Netlify Function Logs
3. Your application logs for errors
