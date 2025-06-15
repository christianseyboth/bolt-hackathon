# Authentication Setup Guide

This guide will help you set up Google OAuth and email authentication in your Next.js app with Supabase.

## Environment Variables

Create a `.env.local` file in your root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google OAuth (Optional - only needed if using Google's pre-built buttons)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Supabase Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Settings > API

### 2. Set Up Database Schema (IMPORTANT!)
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database-setup.sql` (included in this project)
3. Run the SQL script to create the necessary tables, functions, and triggers
4. This step is **crucial** - without it, you'll get "Database error saving new user" errors

### 3. Configure Authentication
1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your Site URL: `http://localhost:3000` (for development)
3. Add redirect URLs: `http://localhost:3000/auth/callback`

### 4. Enable OAuth Providers
1. Go to Authentication > Providers
2. Enable Google and GitHub providers
3. For Google, you'll need to set up Google Cloud Console first

## Google Cloud Console Setup

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

### 2. Enable Google+ API
1. Go to APIs & Services > Library
2. Search for "Google+ API" and enable it

### 3. Configure OAuth Consent Screen
1. Go to APIs & Services > OAuth consent screen
2. Choose "External" for user type
3. Fill in the required information:
   - App name: Your app name
   - User support email: Your email
   - Developer contact information: Your email
4. Add your domain to "Authorized domains": `localhost` (for development)

### 4. Create OAuth Credentials
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth Client ID"
3. Choose "Web application"
4. Configure:
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://your-domain.com` (production)
   - **Authorized redirect URIs**:
     - `https://your-supabase-project.supabase.co/auth/v1/callback` (copy this from Supabase dashboard)
     - `http://localhost:3000/auth/callback` (for testing)

### 5. Configure Supabase with Google Credentials
1. Copy the Client ID and Client Secret from Google Cloud Console
2. In Supabase dashboard, go to Authentication > Providers > Google
3. Enable Google provider
4. Paste your Client ID and Client Secret

## Implementation Details

### Server-Side vs Client-Side

This implementation uses **Server-Side Authentication with PKCE flow** which is recommended for modern Next.js applications because:

- ✅ More secure (no tokens exposed to client)
- ✅ Better for SEO
- ✅ Handles session management automatically
- ✅ Follows Next.js App Router best practices

### Authentication Flow

1. **OAuth (Google/GitHub)**:
   - User clicks OAuth button
   - Redirects to provider's consent screen
   - Provider redirects back to `/auth/callback`
   - Session is established server-side

2. **Email/Password**:
   - User submits form
   - Server action handles authentication
   - Redirects to dashboard on success

3. **Password Reset**:
   - User requests reset via `/reset-password`
   - Email sent with reset link
   - User clicks link, redirected to `/reset-password/update`
   - New password is set

### Available Routes

- `/login` - Login page
- `/register` - Registration page
- `/reset-password` - Password reset request
- `/reset-password/update` - Password update after reset
- `/auth/callback` - OAuth callback handler

### Key Components

- `AuthForm` - Main authentication form component
- `UpdatePasswordForm` - Password update form
- `Register` - Alternative registration component

### Server Actions

- `signIn()` - Email/password login
- `signUp()` - Email/password registration
- `signInWithOAuth()` - OAuth authentication
- `resetPassword()` - Send password reset email
- `updatePassword()` - Update password after reset
- `signOut()` - Sign out user

## Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Try logging in with Google OAuth
4. Try creating an account with email/password
5. Test password reset functionality

## Troubleshooting

### Common Issues

1. **"Database error saving new user"**: This is the most common issue! Run the `database-setup.sql` script in your Supabase SQL Editor
2. **OAuth redirect mismatch**: Make sure your redirect URLs match exactly in both Google Cloud Console and Supabase
3. **Environment variables**: Ensure all required env vars are set correctly
4. **CORS issues**: Make sure your domain is added to authorized domains in Google Cloud Console
5. **Supabase project settings**: Verify site URL and redirect URLs are configured correctly

### Production Deployment

When deploying to production:

1. Update environment variables with production URLs
2. Add production domain to Google Cloud Console authorized domains
3. Update Supabase site URL and redirect URLs
4. Ensure HTTPS is enabled

## Security Considerations

- Always use HTTPS in production
- Keep your Supabase service key secret
- Regularly rotate your OAuth credentials
- Set up proper rate limiting
- Enable email confirmation for new signups (optional)

## Next Steps

- Set up email templates in Supabase
- Configure additional OAuth providers (GitHub, etc.)
- Add user profile management
- Implement role-based access control
- Set up email notifications
