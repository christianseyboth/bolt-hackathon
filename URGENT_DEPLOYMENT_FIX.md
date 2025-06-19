# 🚨 URGENT: Fix Netlify Deployment (Bundle Size Issue)

## The Problem

Netlify functions are exceeding 250MB due to email plugin bundling. Even though we disabled it in
code, it's still enabled in Netlify UI.

## IMMEDIATE ACTION REQUIRED

### 1. Remove Email Environment Variables

Go to Netlify Dashboard → Site Settings → Environment Variables and **DELETE** these:

```
NETLIFY_EMAILS_DIRECTORY
NETLIFY_EMAILS_MAILGUN_DOMAIN
NETLIFY_EMAILS_MAILGUN_HOST_REGION
NETLIFY_EMAILS_PROVIDER
NETLIFY_EMAILS_PROVIDER_API_KEY
NETLIFY_EMAILS_SECRET
```

### 2. Disable Email Plugin in UI

Go to Netlify Dashboard → Site Settings → Functions → Plugins

-   Find `@netlify/plugin-emails`
-   **DISABLE** or **REMOVE** it

### 3. Clear Build Cache

Go to Netlify Dashboard → Site Settings → Build & Deploy

-   Click "Clear cache and retry deploy"

### 4. Trigger New Deploy

After completing steps 1-3, push any small change or trigger manual deploy.

## What This Fixes

-   ✅ Removes 250MB+ email template bundling
-   ✅ Eliminates email plugin conflicts
-   ✅ Allows successful deployment
-   ⚠️ Temporarily disables email reports (they will just log)

## After Deployment Success

1. Site will work normally
2. Scheduled reports will log but not send emails
3. We can implement lighter email solution later
4. All other features remain functional

## Verification

Deploy should complete without "function exceeds 250MB" errors.
