import React from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SubscriptionSettings } from "@/components/dashboard/subscription-settings";
import { DeleteAccountSection } from "@/components/dashboard/delete-account-section";

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader
        heading="Settings"
        subheading="Manage your account settings and preferences"
      />
      <div className="mt-8 space-y-6">
        <SubscriptionSettings />
        <DeleteAccountSection />
      </div>
    </>
  );
}