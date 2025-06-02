import React from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SecurityOverview } from "@/components/dashboard/security/security-overview";
import { RiskiestSenders } from "@/components/dashboard/security/riskiest-senders";
import { AttackTypes } from "@/components/dashboard/security/attack-types";
import { ThreatHistoryChart } from "@/components/dashboard/security/threat-history-chart";
import { ThreatCategoryChart } from "@/components/dashboard/security/threat-category-chart";
import { TopAttackTargetsChart } from "@/components/dashboard/security/top-attack-targets-chart";

export default function SecurityPage() {
  return (
    <>
      <DashboardHeader
        heading="Security Analytics"
        subheading="Comprehensive analysis of your email security posture"
      />
      
      <div className="mt-8">
        <SecurityOverview />
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <ThreatHistoryChart />
        <ThreatCategoryChart />
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <RiskiestSenders />
        <AttackTypes />
      </div>
      
      <div className="mt-6">
        <TopAttackTargetsChart />
      </div>
    </>
  );
}