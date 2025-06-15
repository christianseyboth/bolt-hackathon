# Stripe Setup Guide

## 1. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account or login
3. Switch to Test mode for development

## 2. Get API Keys
1. Go to Developers > API Keys
2. Copy your Publishable key and Secret key
3. Add them to your `.env.local` file

## 3. Create Products and Prices
In your Stripe Dashboard:

### Pro Plan
1. Go to Products > Add Product
2. Name: "Pro"
3. Description: "Perfect for small to medium businesses"
4. Add Monthly Price: $29.00
5. Add Yearly Price: $290.00 (20% discount)
6. Copy the price IDs and update the webhook handler

### Enterprise Plan
1. Go to Products > Add Product
2. Name: "Enterprise"
3. Description: "Advanced security for large organizations"
4. Add Monthly Price: $99.00
5. Add Yearly Price: $990.00 (20% discount)
6. Copy the price IDs and update the webhook handler

## 4. Setup Webhook
1. Go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret to your `.env.local`

## 5. Update Price IDs
In `src/app/api/stripe/webhook/route.ts`, update the `getPlanNameFromPriceId` function with your actual price IDs:

```typescript
const priceToplanMap: Record<string, string> = {
  'price_1ABC123def456': 'Pro',      // Your Pro monthly price ID
  'price_1DEF456ghi789': 'Enterprise', // Your Enterprise monthly price ID
  'price_1GHI789jkl012': 'Pro',      // Your Pro yearly price ID
  'price_1JKL012mno345': 'Enterprise', // Your Enterprise yearly price ID
};
```

## 6. Test the Integration
1. Start your development server
2. Go to `/dashboard/settings`
3. Try subscribing to a plan (use test card: 4242 4242 4242 4242)
4. Verify webhook events are received
5. Check that your database is updated correctly

## 7. Production Setup
1. Switch to Live mode in Stripe
2. Create products and prices in Live mode
3. Update webhook endpoint to production URL
4. Update environment variables with live keys
