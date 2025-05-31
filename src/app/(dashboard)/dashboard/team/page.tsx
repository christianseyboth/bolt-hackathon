import React from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TeamManagement } from "@/components/dashboard/team-management";

export default function TeamPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Team Management"
        subheading="Manage who can send emails for analysis"
      />
      <div className="mt-8">
        <TeamManagement />
      </div>
    </DashboardShell>
  );
}