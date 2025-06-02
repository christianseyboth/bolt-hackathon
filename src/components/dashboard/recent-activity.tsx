import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { IconMail, IconShieldCheck, IconShieldX } from "@tabler/icons-react";

export function RecentActivity() {
  const activities = [
    {
      type: "scan",
      message: "Scanned 12 new emails",
      time: "10 min ago",
      icon: <IconMail className="h-4 w-4 text-cyan-400" />,
    },
    {
      type: "threat",
      message: "Blocked phishing attempt",
      time: "2 hours ago",
      icon: <IconShieldX className="h-4 w-4 text-red-400" />,
    },
    {
      type: "success",
      message: "Security scan completed",
      time: "Yesterday",
      icon: <IconShieldCheck className="h-4 w-4 text-emerald-400" />,
    },
    {
      type: "scan",
      message: "Scanned 27 new emails",
      time: "Yesterday",
      icon: <IconMail className="h-4 w-4 text-cyan-400" />,
    },
  ];

  return (
    <Card className="border border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={index} 
              className="flex items-start space-x-3 border-b border-neutral-800 pb-3 last:border-0 last:pb-0"
            >
              <div className="mt-0.5 bg-neutral-800 rounded-full p-1.5 flex-shrink-0">
                {activity.icon}
              </div>
              <div className="space-y-0.5">
                <div className="text-sm">{activity.message}</div>
                <div className="text-xs text-neutral-400">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}