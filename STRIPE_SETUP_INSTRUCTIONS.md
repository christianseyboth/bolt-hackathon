# Complete Stripe Subscription Setup Guide

Your Stripe subscription system is now ready! Follow these steps to complete the setup:

## 🚀 Quick Start

### 1. Set up Environment Variables

Create a `.env.local` file in your project root with these variables:

```bash
# Stripe Configuration (Required)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Your existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Create Stripe Account & Get Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create account or login
3. Switch to **Test mode** (top right toggle)
4. Go to **Developers > API Keys**
5. Copy your **Publishable key** and **Secret key**

### 3. Create Products in Stripe Dashboard ✅ (Already Done!)

You've already created your products! Here's what you should have:

#### Solo Plan

-   **Name**: Solo
-   **Description**: Perfect for individual professionals
-   **Monthly & Yearly pricing** with Price IDs

#### Entrepreneur Plan

-   **Name**: Entrepreneur
-   **Description**: Ideal for growing businesses
-   **Monthly & Yearly pricing** with Price IDs

#### Team Plan

-   **Name**: Team
-   **Description**: Advanced features for teams
-   **Monthly & Yearly pricing** with Price IDs

### 4. Update Price IDs in Code

Open `src/app/api/stripe/webhook/route.ts` and update the `getPlanNameFromPriceId` function:

```typescript
const priceToplanMap: Record<string, string> = {
    // Replace these with your actual Price IDs from Stripe Dashboard
    price_YOUR_SOLO_MONTHLY_ID: 'Solo', // Solo monthly
    price_YOUR_SOLO_YEARLY_ID: 'Solo', // Solo yearly
    price_YOUR_ENTREPRENEUR_MONTHLY_ID: 'Entrepreneur', // Entrepreneur monthly
    price_YOUR_ENTREPRENEUR_YEARLY_ID: 'Entrepreneur', // Entrepreneur yearly
    price_YOUR_TEAM_MONTHLY_ID: 'Team', // Team monthly
    price_YOUR_TEAM_YEARLY_ID: 'Team', // Team yearly
};
```

### 5. Set up Webhook

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `http://localhost:3000/api/stripe/webhook` (for development)
4. Select these events:
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Webhook secret** (starts with `whsec_`)
7. Add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

## 🧪 Testing Your Setup

### Test Subscription Flow

1. Start your development server:

    ```bash
    npm run dev
    ```

2. Go to `/dashboard/subscription`

3. Try subscribing to a plan using test card:

    - **Card Number**: 4242 4242 4242 4242
    - **Expiry**: Any future date
    - **CVC**: Any 3 digits

4. Verify:
    - Checkout completes successfully
    - You're redirected back with success message
    - Database is updated with subscription
    - You can access billing portal

### Test Webhook Events

1. Install Stripe CLI:

    ```bash
    # macOS
    brew install stripe/stripe-cli/stripe

    # Windows
    scoop install stripe
    ```

2. Login to Stripe CLI:

    ```bash
    stripe login
    ```

3. Forward webhooks to local server:

    ```bash
    stripe listen --forward-to localhost:3000/api/stripe/webhook
    ```

4. Test webhook:
    ```bash
    stripe trigger customer.subscription.created
    ```

## 🚀 Production Deployment

### 1. Switch to Live Mode

1. Toggle to **Live mode** in Stripe Dashboard
2. Create products and prices again in Live mode
3. Update price IDs in your code
4. Get Live mode API keys

### 2. Update Environment Variables

```bash
# Production Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. Update Webhook Endpoint

1. Create new webhook endpoint in Live mode
2. URL: `https://yourdomain.com/api/stripe/webhook`
3. Select same events as before
4. Update `STRIPE_WEBHOOK_SECRET` with live webhook secret

## 📋 Features Included

✅ **Subscription Management**

-   Create checkout sessions
-   Handle subscription lifecycle
-   Customer portal access
-   Real-time webhook processing

✅ **Database Integration**

-   Automatic account creation
-   Subscription status tracking
-   Usage limits per plan

✅ **User Experience**

-   Beautiful subscription UI
-   Success/cancel handling
-   Loading states
-   Error handling

✅ **Security**

-   Webhook signature verification
-   Server-side API key protection
-   User authentication checks

## 🔧 Troubleshooting

### Common Issues

1. **"Invalid API Key"**

    - Check your `.env.local` file
    - Ensure keys are correct for Test/Live mode

2. **Webhook not receiving events**

    - Verify webhook URL is correct
    - Check webhook secret matches
    - Use Stripe CLI for local testing

3. **Database errors**

    - Ensure your database has accounts and subscriptions tables
    - Check Supabase connection

4. **Checkout session fails**
    - Verify price IDs are correct
    - Check account exists in database
    - Review browser console for errors

### Need Help?

-   Check Stripe Dashboard logs
-   Review your server console
-   Test with Stripe CLI
-   Verify database schema matches your queries

Your Stripe subscription system is now ready to accept payments! 🎉
