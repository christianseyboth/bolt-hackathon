import React from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TeamManagement } from "@/components/dashboard/team-management";

export default function TeamPage() {
  return (
    <>
      <DashboardHeader
        heading="Team Management"
        subheading="Manage who can send emails for analysis"
      />
      <div className="mt-8">
        <TeamManagement />
      </div>
    </>
  );
}