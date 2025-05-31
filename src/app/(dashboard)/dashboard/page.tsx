import React from "react";
import { EmailAnalytics } from "@/components/dashboard/email-analytics";
import { SubscriptionInfo } from "@/components/dashboard/subscription-info";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { SecurityScore } from "@/components/dashboard/security-score";
import { PhishingAttempts } from "@/components/dashboard/phishing-attempts";

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader
        heading="Dashboard"
        subheading="Monitor your email security and subscription status"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <EmailAnalytics />
        <SubscriptionInfo />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <SecurityScore />
        <PhishingAttempts />
        <RecentActivity />
      </div>
    </>
  );
}