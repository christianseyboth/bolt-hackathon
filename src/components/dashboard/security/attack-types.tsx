"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconShieldOff,
  IconMailOff,
  IconBug,
  IconFishHook,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// 1) Interface so ändern, dass das Icon eine className-Prop haben darf:
interface AttackType {
  id: number;
  name: string;
  count: number;
  percentage: number;
  icon: React.ReactElement<{ className?: string }>;
  color: string;
}

export function AttackTypes() {
  // 2) Mock-Daten: Icon-Elements jetzt automatisch den richtigen Typ haben
  const attackTypes: AttackType[] = [
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

  const getBgColorClass = (color: string) => {
    const colors: Record<string, string> = {
      purple: "bg-purple-900/30",
      blue: "bg-blue-900/30",
      red: "bg-red-900/30",
      orange: "bg-orange-900/30",
      neutral: "bg-neutral-900/30",
    };
    return colors[color] || "bg-neutral-900/30";
  };

  const getTextColorClass = (color: string) => {
    const colors: Record<string, string> = {
      purple: "text-purple-400",
      blue: "text-blue-400",
      red: "text-red-400",
      orange: "text-orange-400",
      neutral: "text-neutral-400",
    };
    return colors[color] || "text-neutral-400";
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
                  <div
                    className={cn(
                      "p-2 rounded-md mr-2",
                      getBgColorClass(attack.color)
                    )}
                  >
                    {React.cloneElement(attack.icon, {
                      // 3) An dieser Stelle greift jetzt die className-Prop 
                      className: cn(
                        attack.icon.props.className,
                        getTextColorClass(attack.color)
                      ),
                    })}
                  </div>
                  <div>
                    <span className="font-medium">{attack.name}</span>
                    <span className="text-xs text-neutral-400 ml-2">
                      ({attack.count} emails)
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium">{attack.percentage}%</div>
              </div>
              <Progress
                value={attack.percentage}
                className="h-2"
                indicatorClassName={getColorClass(attack.color)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
