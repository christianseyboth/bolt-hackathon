"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconShieldOff, IconMailOff, IconBug, IconFishHook, IconAlertTriangle } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function AttackTypes() {
  // Mock data for attack types
  const attackTypes = [
    {
      id: 1,
      name: "Phishing",
      count: 156,
      percentage: 45,
      icon: <IconFishHook className="h-5 w-5" />,
      color: "purple",
    },
    {
      id: 2,
      name: "Spam",
      count: 98,
      percentage: 28,
      icon: <IconMailOff className="h-5 w-5" />,
      color: "blue",
    },
    {
      id: 3,
      name: "Malware",
      count: 47,
      percentage: 14,
      icon: <IconBug className="h-5 w-5" />,
      color: "red",
    },
    {
      id: 4,
      name: "Scam",
      count: 35,
      percentage: 10,
      icon: <IconShieldOff className="h-5 w-5" />,
      color: "orange",
    },
    {
      id: 5,
      name: "Other",
      count: 11,
      percentage: 3,
      icon: <IconAlertTriangle className="h-5 w-5" />,
      color: "neutral",
    },
  ];

  // Map color to actual Tailwind class
  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      purple: "bg-purple-500/80",
      blue: "bg-blue-500/80",
      red: "bg-red-500/80",
      orange: "bg-orange-500/80",
      neutral: "bg-neutral-500/80",
    };
    
    return colors[color] || "bg-neutral-500/80";
  };

  return (
    <Card className="border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Most Frequent Attack Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {attackTypes.map((attack) => (
            <div key={attack.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`p-2 rounded-md bg-${attack.color}-900/30 mr-2`}>
                    {React.cloneElement(attack.icon as React.ReactElement, {
                      className: cn((attack.icon as React.ReactElement).props.className, `text-${attack.color}-400`),
                    })}
                  </div>
                  <div>
                    <span className="font-medium">{attack.name}</span>
                    <span className="text-xs text-neutral-400 ml-2">({attack.count} emails)</span>
                  </div>
                </div>
                <div className="text-sm font-medium">{attack.percentage}%</div>
              </div>
              <Progress value={attack.percentage} className="h-2" indicatorClassName={getColorClass(attack.color)} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}