# SecPilot - AI-Powered Email Security Platform

**🚨 DEPLOYMENT FIX REQUIRED:** Temporarily remove these environment variables from Netlify to fix
bundle size:

-   `NETLIFY_EMAILS_DIRECTORY`
-   `NETLIFY_EMAILS_MAILGUN_DOMAIN`
-   `NETLIFY_EMAILS_MAILGUN_HOST_REGION`
-   `NETLIFY_EMAILS_PROVIDER`
-   `NETLIFY_EMAILS_PROVIDER_API_KEY`
-   `NETLIFY_EMAILS_SECRET`

Also disable the `@netlify/plugin-emails` plugin in Netlify UI under Site Settings > Functions.

This is **SecPilot**, a modern, security-focused SaaS platform built with Next.js 15, React 18, and
TailwindCSS 4. It leverages advanced AI agent workflows and n8n automation to scan, classify, and
report on potential email threats such as phishing, malware, and spam for individuals and
organizations. The platform is designed for reliability, user-friendliness, and enterprise-grade
scale and security.

## Project Purpose

SecPilot aims to provide robust email security by:

-   Analyzing incoming emails for various threats.
-   Classifying emails based on their risk level (clean, suspicious, phishing, critical).
-   Providing detailed security reports and actionable recommendations.
-   Automating email processing and threat detection workflows.

## Key Features

### Dashboard & Analytics

-   **Comprehensive Dashboard**: Monitor email security and subscription status at a glance.
-   **Email Analysis**: View statistics on scanned emails and detected threats with weekly and
    monthly breakdowns.
-   **Security Score**: Get an overall security rating for your email environment.
-   **Recent Activity**: Track recent email scans and blocked threats.
-   **Phishing Attempts**: See a list of recent phishing attempts with their risk levels.
-   **Security Analytics**: Detailed insights into threat history, most frequent attack types,
    riskiest senders/domains, and top attack targets.

### Email Management

-   **Email List**: A searchable and filterable list of all analyzed emails.
-   **Email Detail View**: In-depth security analysis for each email, including content flags, URL
    analysis, attachment risk, and raw content preview.

### Account & Subscription Management

-   **Subscription Info**: Monitor your current plan usage and remaining capacity.
-   **Team Management**: Add, view, and remove team members, with clear visibility on user limits.
-   **Subscription Settings**: Manage your subscription plan, billing information, and view invoice
    history.
-   **Account Deletion**: Secure process for permanently deleting your account and data.

## Technologies Used

### Frontend

-   **Next.js 15**: React framework for production.
-   **React 19**: For building user interfaces.
-   **TailwindCSS 4**: For rapid and responsive UI development.
-   **shadcn/ui**: For core application UI components (buttons, cards, dialogs, tables, etc.).
-   **Aceternity UI**: For visually rich and animated marketing/landing page components.
-   **Lucide Icons**: Consistent icon library across the application.
-   **Recharts**: For powerful and customizable data visualization in charts.
-   **Motion**: For smooth animations and transitions.

### Backend & Database

-   **Supabase**: For authentication, secure data storage, and potentially file storage and vector
    search for AI.

### Payments

-   **Stripe**: For secure subscription management and billing.

### Automation & AI

-   **n8n**: To orchestrate automated workflows for email ingestion, triggering AI agents for
    analysis, and managing the email processing pipeline.
-   **AI Agents**: Integrated for advanced email scanning, classification, and threat detection.

