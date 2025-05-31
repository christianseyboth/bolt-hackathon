import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function PhishingAttempts() {
  const attempts = [
    {
      sender: "paypal-security@mail.com",
      date: "Today",
      time: "09:42 AM",
      risk: "high",
    },
    {
      sender: "amazon-orders@amzn-support.net",
      date: "Yesterday",
      time: "03:16 PM",
      risk: "high",
    },
    {
      sender: "microsoft365@outlook-verify.com",
      date: "May 15",
      time: "10:22 AM",
      risk: "medium",
    },
  ];

  const getRiskBadge = (risk: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (risk) {
      case "high":
        return <span className={`${baseClasses} bg-red-900/30 text-red-400`}>High Risk</span>;
      case "medium":
        return <span className={`${baseClasses} bg-amber-900/30 text-amber-400`}>Medium Risk</span>;
      case "low":
        return <span className={`${baseClasses} bg-emerald-900/30 text-emerald-400`}>Low Risk</span>;
      default:
        return null;
    }
  };

  return (
    <Card className="border border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Phishing Attempts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attempts.map((attempt, index) => (
            <div 
              key={index} 
              className="flex justify-between items-start border-b border-neutral-800 pb-3 last:border-0 last:pb-0"
            >
              <div className="overflow-hidden">
                <div className="font-medium text-sm truncate max-w-[160px] mb-1">{attempt.sender}</div>
                <div className="text-xs text-neutral-400">
                  {attempt.date} at {attempt.time}
                </div>
              </div>
              <div>{getRiskBadge(attempt.risk)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}