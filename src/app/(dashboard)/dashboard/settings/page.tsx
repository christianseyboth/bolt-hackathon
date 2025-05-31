import React from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SubscriptionSettings } from "@/components/dashboard/subscription-settings";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        subheading="Manage your account settings and preferences"
      />
      <div className="mt-8 space-y-6">
        <SubscriptionSettings />
      </div>
    </DashboardShell>
  );
}