import React from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EmailList } from "@/components/dashboard/email-list";

export default function EmailsPage() {
  return (
    <>
      <DashboardHeader
        heading="Email Analysis"
        subheading="View and manage all analyzed emails"
      />
      <div className="mt-8">
        <EmailList />
      </div>
    </>
  );
}